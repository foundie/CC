const tf = require('@tensorflow/tfjs-node');
const jpeg = require('jpeg-js');
require('dotenv').config();

class L2 {
  constructor(config) {
    this.l2 = config.l2;
  }

  apply(x) {
    return tf.sum(tf.mul(this.l2, tf.square(x)));
  }

  getConfig() {
    return {
      l2: this.l2
    };
  }

  static fromConfig(cls, config) {
    return new cls(config);
  }

  static className = 'L2';
}

class ModelService_SkinTone {
  constructor() {
    this.model = null;
    this.modelUrl = process.env.MODEL_ST;
    tf.serialization.registerClass(L2); // Register the custom regularizer
    this.modelPromise = this.loadModel();
    this.modelPromise.then(model => {
      this.model = model;
    });
  }

  async loadModel() {
    let model;
    try {
      model = await tf.loadLayersModel(this.modelUrl);
      console.log('Model untuk Skin Tone berhasil dimuat!');
    } catch (error) {
      console.error('Error loading the model:', error);
    }
    return model;
  }

  async predict(imageBuffer) {
    try {
      console.log('Starting prediction...');
      // Convert imageBuffer to tensor
      const tensor = this.imageToTensor(imageBuffer);
      const prediction = this.model.predict(tensor);
      // Interpret the prediction
      const label = this.interpretPrediction(prediction);
      console.log('Hasil Prediksi:', label);

      let result;
      if (label == '0') {
        result = 'Medium Tone'
      } else if (label == '1') {
        result = 'Light' 
      } else {
        result = 'Dark'
      }
      return result;
    } catch (error) {
      console.error('Error during prediction:', error);
    }
  }

  interpretPrediction(prediction) {
    const predictionValue = prediction.dataSync()[0];
    return predictionValue;
  }

  imageToTensor(imageBuffer) {
    const { width, height, data } = jpeg.decode(imageBuffer, {
      useTArray: true,
    });
    let offset = 0; // offset into original data
    let buffer = new Uint8Array(width * height * 3);
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset];
      buffer[i + 1] = data[offset + 1];
      buffer[i + 2] = data[offset + 2];

      offset += 4;
    }
    let tensor = tf.tensor3d(buffer, [width, height, 3]);
    // Add a dimension for the batch
    tensor = tensor.expandDims(0);
    // Resize to the expected model input size
    tensor = tf.image.resizeBilinear(tensor, [64, 64]);
    return tensor;
  }

}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

module.exports = ModelService_SkinTone;