const {  
  getAllProductHandler, filteredProductHandler, predictHandlerST
} = require('../server/handler');



const routes = [
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