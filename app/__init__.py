from flask import Flask
from app.modules.face_prediction.views import face_prediction_blueprint

def create_app():
    app = Flask(__name__)
    app.register_blueprint(face_prediction_blueprint, url_prefix='/predict')
    return app
