from flask import Blueprint, request, jsonify
from .utils import evaluate, predict_image
import tensorflow as tf
import os
import tempfile

# Mendapatkan absolute path untuk direktori saat ini dan model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model', '79999_iter.pth')
H5_MODEL_PATH = os.path.join(BASE_DIR, 'model', 'my_model.h5')

face_prediction_blueprint = Blueprint('face_prediction', __name__)

@face_prediction_blueprint.route('/face', methods=['POST'])
def predict():
    """
    Endpoint untuk memprediksi visual weight wajah dari gambar yang diunggah
    Returns:
        JSON response dengan hasil prediksi atau pesan error
    """
    try:
        # Validasi input image
        if 'image' not in request.files:
            return jsonify({
                "error": True,
                "status": "fail",
                "message": "Mohon masukkan image"
            }), 400

        image_file = request.files['image']
        
        # Validasi file tidak kosong
        if not image_file or image_file.filename == '':
            return jsonify({
                "error": True,
                "status": "fail",
                "message": "File gambar tidak valid"
            }), 400

        # Simpan file ke temporary directory
        image_path = os.path.join(tempfile.gettempdir(), image_file.filename)
        image_file.save(image_path)
        
        # Melakukan evaluasi dan segmentasi wajah
        masked_image = evaluate(image_path=image_path, cp=MODEL_PATH)
        
        # Hapus file temporary
        os.remove(image_path)
        
        if masked_image is not None:
            # Load model dan lakukan prediksi
            model = tf.keras.models.load_model(H5_MODEL_PATH)
            predicted_class = predict_image(masked_image, model)
            
            # Tentukan hasil prediksi
            result = 'Low Visual Weight' if predicted_class < 1 else 'High Visual Weight'
            
            return jsonify({
                "error": False,
                "status": "success",
                "predicted_class": result,
                "confidence_score": float(predicted_class)
            })
        else:
            return jsonify({
                "error": True,
                "status": "fail",
                "message": "Tidak terdeteksi wajah dalam gambar"
            }), 422

    except Exception as e:
        # Log error jika diperlukan
        print(f"Error during prediction: {str(e)}")
        return jsonify({
            "error": True,
            "status": "error",
            "message": "Terjadi kesalahan dalam pemrosesan gambar"
        }), 500