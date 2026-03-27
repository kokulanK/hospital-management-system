import tensorflow as tf
import numpy as np
from PIL import Image
import io

# Configuration
IMG_SIZE = 224
CLASS_NAMES = ['BCC', 'BKL', 'MEL', 'NV']

# Class-specific thresholds (based on confusion matrix reliability)
CLASS_THRESHOLDS = {
    'BCC': 0.35,
    'BKL': 0.40,
    'MEL': 0.45,
    'NV': 0.35
}

# Minimum margin between top 2 predictions
MARGIN_THRESHOLD = 0.15

# Load model
MODEL_PATH = 'improved_custom_cnn.keras'
model = tf.keras.models.load_model(MODEL_PATH)

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict(image_bytes):
    img_tensor = preprocess_image(image_bytes)
    predictions = model.predict(img_tensor)[0]

    # Sort predictions
    sorted_indices = np.argsort(predictions)[::-1]
    top_idx = sorted_indices[0]
    second_idx = sorted_indices[1]

    top_class = CLASS_NAMES[top_idx]
    top_conf = predictions[top_idx]
    second_conf = predictions[second_idx]

    # Get class-specific threshold
    threshold = CLASS_THRESHOLDS[top_class]

    # Check margin
    margin = top_conf - second_conf

    if top_conf >= threshold and margin >= MARGIN_THRESHOLD:
        return {
            'class': top_class,
            'confidence': float(top_conf),
            'all_probabilities': {
                cls: float(prob) for cls, prob in zip(CLASS_NAMES, predictions)
            }
        }
    else:
        return {
            'class': 'uncertain',
            'confidence': float(top_conf),
            'message': 'Prediction rejected due to low confidence or ambiguity.',
            'all_probabilities': {
                cls: float(prob) for cls, prob in zip(CLASS_NAMES, predictions)
            }
        }