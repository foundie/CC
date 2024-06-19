const {  
  getAllProductHandler, filteredProductHandler,
  predictHandlerST, predictHandlerFC, compareProduct,
} = require('../server/handler');


const routes = [
  {
    method: 'GET',
    path: '/products/compare',
    handler: compareProduct
  },
  {
    method: 'POST',
    path: '/predict/face',
    handler: predictHandlerFC,
    options: {
        payload: {
        allow: 'multipart/form-data',
        multipart: true,
      }
    }
  },
  {
    method: 'POST',
    path: '/predict/skin',
    handler: predictHandlerST,
    options: {
        payload: { 
        allow: 'multipart/form-data',
        multipart: true,
      }
    }
  },
  {
    method: 'GET',
    path: '/products',
    handler: getAllProductHandler
  },
  {
    method: 'POST',
    path: '/products/filter',
    handler: filteredProductHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
      }
    }
  },
]

module.exports = routes;