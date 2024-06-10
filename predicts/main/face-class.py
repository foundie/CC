import os
import numpy as np
import torch
import tensorflow as tf
import cv2
from PIL import Image
import torchvision.transforms as transforms
from model import BiSeNet
from flask import Flask, request, jsonify
import tempfile


app = Flask(__name__)


# Fungsi untuk visualisasi dan mask
def vis_parsing_maps(im, parsing_anno, stride, use_grayscale=False, crop_face=True):
    desired_parts = {1, 3, 4, 5, 10, 12, 13}
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    im = np.array(im)
    vis_im = im.copy().astype(np.uint8)
    vis_parsing_anno = parsing_anno.copy().astype(np.uint8)
    vis_parsing_anno = cv2.resize(vis_parsing_anno, None, fx=stride, fy=stride, interpolation=cv2.INTER_NEAREST)
    mask = np.zeros((vis_parsing_anno.shape[0], vis_parsing_anno.shape[1]), dtype=np.uint8)
    for pi in desired_parts:
        mask[vis_parsing_anno == pi] = 1
    vis_im = cv2.bitwise_and(vis_im, vis_im, mask=mask)
    white_background = np.full_like(vis_im, 255)
    vis_im = np.where(mask[:, :, None] == 1, vis_im, white_background)
    if crop_face:
        gray_im = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY)
        faces = face_cascade.detectMultiScale(gray_im, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30), flags=cv2.CASCADE_SCALE_IMAGE)
        if len(faces) > 0:
            (x, y, w, h) = faces[0]
            vis_im = vis_im[y:y+h, x:x+w]
        else:
            # Jika tidak terdeteksi wajah, keluar dengan pesan
            print("Tidak terdeteksi wajah.")
            return None
    if use_grayscale:
        vis_im = cv2.cvtColor(vis_im, cv2.COLOR_RGB2GRAY)
    return vis_im

# Fungsi untuk evaluasi segmentasi dan mengembalikan hasil segmentasi
def evaluate(image_path, cp='79999_iter.pth'):
    n_classes = 19
    net = BiSeNet(n_classes=n_classes)
    net.cpu()
    net.load_state_dict(torch.load(cp, map_location=torch.device('cpu')))
    net.eval()
    to_tensor = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225)),
    ])
    img = Image.open(image_path).resize((512, 512), Image.BILINEAR)
    img_tensor = to_tensor(img).unsqueeze(0).cpu()
    with torch.no_grad():
        out = net(img_tensor)[0]
        parsing = out.squeeze(0).cpu().numpy().argmax(0)
        masked_img = vis_parsing_maps(img, parsing, stride=1)
    return masked_img

# Fungsi untuk prediksi gambar menggunakan model TensorFlow
def predict_image(image_array, model):
    img_array = cv2.resize(image_array, (64, 64)) / 255.0
    img_array = np.expand_dims(img_array, axis=0)  # Menambahkan batch dimension
    prediction = model.predict(img_array)
    class_label = int(prediction[0][0] > 0.5)  # Extract the scalar value from prediction
    return class_label

@app.route('/predict/face', methods=['POST'])
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
    print (image_path)
    
    # Melakukan evaluasi dan segmentasi
    masked_image = evaluate(image_path=image_path, cp='79999_iter.pth')
    if masked_image is not None:
            # Melakukan prediksi pada gambar hasil segmentasi
            model = tf.keras.models.load_model("/home/instance-training/preprocessing/foundie/predicts/model/my_model.h5")
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
