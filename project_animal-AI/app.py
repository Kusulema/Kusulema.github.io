from flask import Flask, request, render_template, jsonify, send_from_directory
import os
import numpy as np
import cv2
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
from werkzeug.utils import secure_filename

# pip install tensorflow opencv-python matplotlib flask numpy werkzeug
# mkdir uploads
# python app.py

app = Flask(__name__)

model = MobileNetV2(weights='imagenet')

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def predict_animal(image_path):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))
    img = np.expand_dims(img, axis=0)

    img = preprocess_input(img)

    preds = model.predict(img)

    decoded_preds = decode_predictions(preds, top=5)[0]

    return decoded_preds

# Путь для отдачи изображений из папки uploads
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    filename = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
    file.save(filename)

    predictions = predict_animal(filename)
    
    results = []
    for pred in predictions:
        results.append({
            'class': pred[1],
            'description': pred[1],
            'probability': str(pred[2])
        })
    
    # Путь для изображения, чтобы передать в HTML
    image_url = f"/uploads/{file.filename}"  # Формируем путь для изображения
    return jsonify({'predictions': results, 'image_url': image_url})

if __name__ == '__main__':
    app.run(debug=True)
