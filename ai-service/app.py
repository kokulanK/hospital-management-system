from flask import Flask, request, jsonify
import inference
import requests

app = Flask(__name__)

# Base route for testing
@app.route('/api', methods=['GET'])
def api_home():
    return jsonify({'message': 'AI Backend is running'})

# Prediction endpoint
@app.route('/api/predict', methods=['POST'])
def predict():
    # Option 1: receive an image file
    if 'image' in request.files:
        file = request.files['image']
        image_bytes = file.read()
        result = inference.predict(image_bytes)
        return jsonify(result)

    # Option 2: receive an image URL
    data = request.get_json()
    if data and 'url' in data:
        try:
            response = requests.get(data['url'])
            image_bytes = response.content
            result = inference.predict(image_bytes)
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'No image provided'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001)  # new port