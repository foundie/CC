const { getAllProduct, filteredProduct } = require('../services/products')
const ModelService_SkinTone = require('../predicts/skinTone');
const ModelService_FaceClassification = require('../predicts/faceClassification');
const { readFileFromGCS, showProductsDetailsByBrand } = require('../services/compare');

const compareProduct = async (request, h) => {
  const { index } = request.query;

  if (index === undefined) {
    return h.response({
      error: true,
      status: 'fail', 
      message: 'Parameter index diperlukan.' 
    }).code(400);
  }

  const selectedIndex = parseInt(index.trim(), 10);

  if (isNaN(selectedIndex)) {
    return h.response({
    error: true,
    status: 'fail', 
    message: 'Parameter index harus berupa angka.' 
    }).code(400);
  }

  try {
    const cleanResults = await readFileFromGCS();
    console.log(`Panjang data yang dibaca dari GCS: ${cleanResults.length}`);
    console.log(`Selected Index: ${selectedIndex}`)
    const result = showProductsDetailsByBrand(cleanResults, selectedIndex);

    if (result && result.topSimilarities && result.topSimilarities.length > 0) {
      const { topSimilarities, brandCounts, referenceProduct } = result;

      return h.response({
        error: false,
        status: "success",
        product: {
          "Brand": referenceProduct['Brand'],
          "Product Title": referenceProduct['Product Title'],
          "Variant Name": referenceProduct['Variant Name'],
          "Shade": referenceProduct['Shade'],
          "Tone": referenceProduct['Tone'],
          "Color HEX": referenceProduct['Color HEX'],
          "Season 1 Name": referenceProduct['Season 1 Name'],
          "Type": referenceProduct['Type']
        },
        similarProducts: topSimilarities,
        brandCounts: brandCounts
      }).code(200);
    } else {
      return h.response({
        error: true,
        status: 'fail', 
        message: 'No similar products found.'
       }).code(404);
    }
  } catch (error) {
    console.error(error);
    return h.response({
      error: true,
      status: 'fail', 
      message: error.message 
    }).code(500);
  }
};


function capitalizeFirstLetter(string) {
  return string.split(' ')
  .map(word => word.charAt(0)
  .toUpperCase() 
  + word.slice(1)
  .toLowerCase()).join(' ');
}

const modelServiceST = new ModelService_SkinTone();
async function predictHandlerST(request, h) {
  try {
    const { payload } = request;
    if (!payload || !payload.image) {
      const response = h.response({
        error: true,
        status: 'fail',
        message: 'Mohon masukkan image dengan benar.'
      });
      response.code(400);
      return response;
    }
    const imageBuffer = Buffer.from(payload.image, 'base64');
    const label = await modelServiceST.predict(imageBuffer);
    let result = await modelServiceST.predict(imageBuffer);
    result = result ? capitalizeFirstLetter(result) : result;
    const recommendedProduct = await modelServiceST.productRecommendation(imageBuffer);

    if (label == null){
      const response = h.response({
        error: true,
        status: 'fail',
        message: 'Prediksi gagal.'
      });
      response.code(400);
      return response;
    } else {
      const response = h.response({
        error: false, 
        status: 'success', 
        result: result,
        message: 'Berikut rekomendasi produk untuk anda',
        product: recommendedProduct
        });
        response.code(200);
        return response;
    }
} catch (error) {
    console.error('Error during prediction :', error);
    const response = h.response({
      error: true, 
      status: 'fail', 
      message: error.message 
    });
    response.code(500);
    return response;
  }
}

const modelServiceFC = new ModelService_FaceClassification();
async function predictHandlerFC(request, h) {
  try {
    const { payload } = request;
    const imageBuffer = Buffer.from(payload.image, 'base64');
    const prediction = await modelServiceFC.predict(imageBuffer);
    const result = await modelServiceFC.predict(imageBuffer);
    console.log(result);
    if (prediction != null){
      let explanation;
      if (result == 'Low Visual Weight'){
        explanation = 'Jenis klasifikasi wajah anda adalah Low Visual Weight'
      } else {
        explanation = 'Jenis klasifikasi wajah anda adalah High Visual Weight'
      }
      const response = h.response({
        error: false, 
        status: 'success', 
        prediction,
        message: explanation
        });
        response.code(200);
        return response;
    } else {
      const response = h.response({
        error: true,
        status: 'fail',
        message: 'Prediksi gagal. Mohon masukkan image dengan benar'
      });
      response.code(400);
      return response;
    }
} catch (error) {
    console.error('Error during prediction :', error);
    const response = h.response({
      error: true, 
      status: 'fail', 
      message: error.message 
    });
    response.code(500);
    return response;
  }
}

async function getAllProductHandler(request, h){
  const {limit, skip} = request.query;
  const product = await getAllProduct(limit, skip);
  const response = h.response({
    error: false,
    status: "success",
    data: product,
  });
  response.code(200);
  return response;
}

async function filteredProductHandler(request, h){
  const {name} = request.payload;
  if (name == '') {
    const response = h.response({
      error: true,
      status: "fail",
      message: "Mohon masukan nama produk"
    });
    response.code(400);
    return response;
  }

  const searchResult = await filteredProduct(name);
  const response = h.response({
    error: false,
    status : "success",
    message: "Berikut adalah hasil pencarian Anda",
    data: searchResult
  });
  if (searchResult == ''){
    const response = h.response({
      error: true,
      status: "fail",
      message: "Produk Tidak ada. Mohon masukkan Nama Produk dengan benar"
    });
    response.code(400);
    return response;
  } else {
    response.code(200);
    return response;
  }
}


module.exports = { predictHandlerST, predictHandlerFC,
  getAllProductHandler, filteredProductHandler, compareProduct,
};