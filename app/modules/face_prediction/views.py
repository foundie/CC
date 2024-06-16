# views.py
from flask import Blueprint, request, jsonify
from .utils import evaluate, predict_image
import tensorflow as tf
import os
import tempfile

face_prediction_blueprint = Blueprint('face_prediction', __name__)

@face_prediction_blueprint.route('/face', methods=['POST'])
def predict():
    if 'image' not in request.files or not 'image':
        return jsonify({
            "error": True,
            "status": "fail",
            "message": "Mohon masukkan image"
            }), 400
    
    image_file = request.files['image']
    image_path = os.path.join(tempfile.gettempdir(), image_file.filename)
    image_file.save(image_path)
    
    # Melakukan evaluasi dan segmentasi
    masked_image = evaluate(image_path=image_path, cp='79999_iter.pth')
    if masked_image is not None:
        # Melakukan prediksi pada gambar hasil segmentasi
        model = tf.keras.models.load_model("./model/my_model.h5")
        predicted_class = predict_image(masked_image, model)
        result = 'Low Visual Weight' if predicted_class < 1 else 'High Visual Weight'
        return jsonify({
            "error": False,
            "status": "success",
            "predicted_class": result})
    else:
        return jsonify({
            "error": True,
            "status": "fail",
            "message": "Tidak terdeteksi wajah"
            }), 500
