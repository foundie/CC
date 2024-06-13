const tf = require('@tensorflow/tfjs-node');
const jpeg = require('jpeg-js');
require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');
const projectId = 'capstone-project-foundie';

const bigquery = new BigQuery({
  projectId,
});

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
      console.log('Hasil prediksi : ', label)
      let result;
      if (label == '0') {
        result = 'dark'
      } else if (label == '1') {
        result = 'light' 
      } else if (label == '2'){
        result = 'medium'
      }
      return result;
    } catch (error) {
      console.error('Error during prediction:', error);
    }
  }

  async productRecommendation(imageBuffer) {
    try {
      const result = await this.predict(imageBuffer);
      const query = `SELECT *
      FROM \`capstone-project-foundie.all_products.data_tone\` 
      WHERE \`tone\` LIKE '%${result}%'
      LIMIT 10
      `;
      const options = {
        query: query,
        location: 'asia-southeast2',
      };
      const [job] = await bigquery.createQueryJob(options);
      const [rows] = await job.getQueryResults();
      const recommendedProduct = [];
    
      rows.forEach((row) => {
        recommendedProduct.push({
        "Brand": row.brand,
        "Product Title": row.product_title,
        "Variant Name" : row.variant_name,
        "Tone" : row.tone,
        "Type": row.type,
        "Color Hex": row.color_hex,
        "Color RGB": row.color_rgb,
        "Season 1 Name": row.season_1_name,
        "Season 1 Percent": row.season_1_percent,
        "S1 Closest Color": row.s1_closest_color,
        "Season 2 Name": row.season_2_name,
        "Season 2 Percent": row.season_2_percent,
        "S2 Closest Color": row.s2_closest_color,
        "Product URL": row.product_url
        });
      });
      return recommendedProduct;
    } catch (error) {
      console.error('Error during recommend:', error);
    }
  }

  interpretPrediction(prediction) {
    const predictionValue = prediction.dataSync();
    const result = predictionValue.indexOf(Math.max(...predictionValue));
    return String(result); 
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