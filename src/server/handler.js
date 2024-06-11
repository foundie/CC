const { getAllProduct, filteredProduct } = require('../services/products');
const ModelService_SkinTone = require('../predicts/skinTone');


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
    const result = await modelServiceST.predict(imageBuffer);
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
        message: 'Berikut rekomendasi produk untuk anda : ',
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


async function getAllProductHandler(request, h){
  const product = await getAllProduct();
  const response = h.response({
    error: false,
    status: "success",
    data: product,
  });
  response.code(200);
  return response;
}

async function filteredProductHandler(request, h){
  const {name, season} = request.payload;
  const searchResult = await filteredProduct(name, season);
  
  const response = h.response({
    error: false,
    status : "success",
    message: "Berikut adalah hasil pencarian Anda : ",
    data: searchResult
  });
  if (searchResult == ''){
    const response = h.response({
      error: true,
      status: "fail",
      message: "Produk Tidak ada. Mohon masukkan Nama Produk dan Season dengan benar"
    });
    response.code(400);
    return response;
  } else {
    response.code(200);
    return response;
  }
}


module.exports = { predictHandlerST,
  getAllProductHandler, filteredProductHandler,
};