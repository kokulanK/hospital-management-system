import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

class SkinProjectValidator:
    """
    V4 Gatekeeper — 4-Gate Pipeline:
      Gate 1: Brightness   — reject too dark / too bright (flash glare)
      Gate 2: Blur         — reject blurry / noisy images
      Gate 3: AI skin      — MobileNetV2 trained on SCIN confirms skin present
      Gate 4: Coverage     — rejects portraits/full-body shots where skin
                             doesn't dominate the frame
    """

    def __init__(self,
                 model_path="models/best_gatekeeper_v2.keras",
                 blur_limit_normal      = 9.00,  
                 blur_limit_lowlight    = 6.0,
                 low_light_threshold    = 70,
                 skin_ai_threshold      = 0.50,
                 skin_coverage_min      = 0.35):
        self.blur_limit_normal   = blur_limit_normal
        self.blur_limit_lowlight = blur_limit_lowlight
        self.low_light_threshold = low_light_threshold
        self.skin_ai_threshold   = skin_ai_threshold
        self.skin_coverage_min   = skin_coverage_min
        self.model = self._create_model()
        self._load_weights(model_path)

    # ── Model ────────────────────────────────────────────────────────────────

    def _create_model(self):
        """
        MUST match validation_V3 training exactly:
        MobileNetV2 → GAP → Dropout(0.45) → Dense(1, sigmoid)
        """
        base = MobileNetV2(weights='imagenet', include_top=False,
                           input_shape=(224, 224, 3))
        base.trainable = True
        for layer in base.layers[:-35]:
            layer.trainable = False
        model = models.Sequential([
            base,
            layers.GlobalAveragePooling2D(),
            layers.Dropout(0.45),
            layers.Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer=tf.keras.optimizers.Adam(1e-5),
                      loss='binary_crossentropy', metrics=['accuracy'])
        return model

    def _load_weights(self, path):
        if os.path.exists(path):
            try:
                self.model.load_weights(path)
                print(f'✅ Weights loaded from: {path}')
            except Exception as e:
                print(f'❌ Weight load failed: {e}')
        else:
            print(f'⚠️  File not found: {path}')

    # ── Preprocessing ────────────────────────────────────────────────────────

    def standardize_image(self, img):
        """Resize to 500px wide for consistent CV checks."""
        h, w = img.shape[:2]
        if w == 0: return img
        return cv2.resize(img, (500, int(h * 500 / w)), interpolation=cv2.INTER_AREA)

    def remove_hair(self, img_bgr):
        """Black Top-Hat + inpainting to stop hair faking high sharpness."""
        gray    = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        kernel  = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
        tophat  = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)
        _, mask = cv2.threshold(tophat, 10, 255, cv2.THRESH_BINARY)
        return cv2.inpaint(img_bgr, mask, 3, cv2.INPAINT_TELEA)

    def preprocess_for_model(self, img_bgr):
        """
        Replicates validation_V3 training preprocessing exactly:
        BGR→RGB, center-crop to square, resize 224x224,
        MobileNetV2 preprocess_input (scales to [-1, 1]).
        """
        rgb  = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        h, w = rgb.shape[:2]
        s    = min(h, w)
        rgb  = rgb[(h-s)//2:(h-s)//2+s, (w-s)//2:(w-s)//2+s]
        rgb  = cv2.resize(rgb, (224, 224))
        arr  = preprocess_input(rgb.astype(np.float32))  # [-1, 1], NOT /255
        return np.expand_dims(arr, axis=0)

    # ── Gate 1: Brightness ───────────────────────────────────────────────────

    def check_brightness(self, img_bgr):
        yuv   = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YUV)
        avg_y = float(np.mean(yuv[:, :, 0]))
        is_ok = 70 < avg_y < 190
        is_low = avg_y < self.low_light_threshold
        return is_ok, round(avg_y, 1), is_low

    # ── Gate 2: Blur ─────────────────────────────────────────────────────────

    def check_blur(self, img_bgr, is_low_light):
        clean = self.remove_hair(img_bgr)
        gray  = cv2.cvtColor(clean, cv2.COLOR_BGR2GRAY)
        if is_low_light:
            gray = cv2.medianBlur(gray, 5)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        limit = self.blur_limit_lowlight if is_low_light else self.blur_limit_normal
        return variance > limit, round(variance, 2)

    # ── Gate 3: AI Skin Detection ─────────────────────────────────────────────

    def check_skin_ai(self, img_bgr):
        """
        Runs MobileNetV2 on the standardized image.
        Threshold lowered to 0.50 to fix dark skin false rejections.
        """
        try:
            tensor = self.preprocess_for_model(img_bgr)
            prob   = float(self.model.predict(tensor, verbose=0)[0][0])
            return prob >= self.skin_ai_threshold, round(prob, 4)
        except Exception as e:
            print(f'AI error: {e}')
            return False, 0.0

    # ── Gate 4: Skin Coverage ─────────────────────────────────────────────────

    def check_skin_coverage(self, img_bgr):
        ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
        mask  = cv2.inRange(ycrcb, (0, 130, 75), (255, 185, 140))
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
        mask   = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        ratio  = np.count_nonzero(mask) / mask.size
        return ratio >= self.skin_coverage_min, round(ratio, 3)

    # ── Main validate() ───────────────────────────────────────────────────────

    def validate(self, image_path):
        img = cv2.imread(str(image_path))
        if img is None:
            return {'status': 'error', 'reason': 'Cannot read file', 'detail': ''}

        img = self.standardize_image(img)

        # Gate 1: Brightness
        b_ok, b_score, is_low = self.check_brightness(img)
        if not b_ok:
            why = 'Too bright (flash/glare)' if b_score > 215 else 'Too dark'
            return {'status': 'rejected', 'reason': 'Lighting',
                    'detail': f'{why} — brightness={b_score}'}

        # Gate 2: Blur
        blur_ok, blur_score = self.check_blur(img, is_low)
        if not blur_ok:
            return {'status': 'rejected', 'reason': 'Blur',
                    'detail': f'Laplacian variance={blur_score} (need >{self.blur_limit_normal})'}

        # Gate 3: AI skin
        ai_ok, ai_score = self.check_skin_ai(img)
        if not ai_ok:
            return {'status': 'rejected', 'reason': 'Not Skin (AI)',
                    'detail': f'AI confidence={ai_score*100:.1f}% (need >{self.skin_ai_threshold*100:.0f}%)'}

        # Gate 4: Coverage
        cov_ok, cov_ratio = self.check_skin_coverage(img)
        if not cov_ok:
            return {'status': 'rejected', 'reason': 'Not a closeup',
                    'detail': f'Skin coverage={cov_ratio*100:.1f}% (need >{self.skin_coverage_min*100:.0f}%)'}

        return {
            'status': 'accepted',
            'detail': f'Bright={b_score} | Blur={blur_score} | AI={ai_score*100:.1f}% | Coverage={cov_ratio*100:.1f}%',
            'scores': {
                'bright': b_score,
                'blur': blur_score,
                'skin_ai_prob': ai_score,
                'coverage': cov_ratio
            }
        }
