const { BigQuery } = require('@google-cloud/bigquery');
const projectId = 'capstone-project-foundie';

const bigquery = new BigQuery({
  projectId,
});

async function getAllProduct(){
  const query = `SELECT *
  FROM \`capstone-project-foundie.all_products.data\`
  LIMIT 20`;
  const options = {
    query: query,
    location: 'asia-southeast2',
  };

  const [job] = await bigquery.createQueryJob(options);
  const [rows] = await job.getQueryResults();
  const allProduct = [];

  rows.forEach((row) => {
    let imageUrl;
    if (row.brand == 'hanasui') {
      imageUrl =  'https://hanasui.id/front-end/assets/img/product_image/bf83c7d933d5f63108fb3b2c327f8cf3.png'
    }
    if (row.brand == 'emina') {
      imageUrl = 'https://www.eminacosmetics.com/cfind/source/thumb/images/product/creamy-tint/cover_w322_h_creamy-tint---wild-berry---with-swatch.png'   
    }
    if (row.brand == 'pixy') {
      imageUrl = 'https://www.pixy.co.id/lib/images/product/PIXY20Lip20Cream20-20Chic20Rose.png'
    }
    if (row.brand == 'somethinc') {
      imaeUrl = 'https://images.somethinc.com/uploads/products/thumbs/800x800/WEB_Bond.jpg'
    }
    if (row.brand == 'wardah') {
      imageUrl = 'https://d2jlkn4m127vak.cloudfront.net/medias/products/variant-1581585309.png'
    }
    if (row.brand == 'maybelline') {
      imageUrl = 'https://www.maybelline.com/-/media/project/loreal/brand-sites/mny/americas/us/lips-makeup/lipstick/superstay-24-liquid-lipstick/maybelline-lip-color-super-stay-24-everlasting-wine-041554237726-o.jpg?rev=c244cf0a6c554169b608a76a12d16c5e&cx=0&cy=0&cw=760&ch=1130&hash=917485440270CED41DC5B10E9FECE8A2'
    }
    allProduct.push({
      "Image": imageUrl,
      "Brand": row.brand,
      "Product Title": row.product_title,
      "Variant Name" : row.variant_name,
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
return allProduct;
};

async function filteredProduct(name, season){
    const query = `SELECT *
    FROM \`capstone-project-foundie.all_products.data\` 
    WHERE \`product_title\` LIKE '%${name}%' 
    AND \`season_1_name\` LIKE '%${season}%'
    OR \`season_2_name\` LIKE '%${season}%'
    LIMIT 20
    `;
    const options = {
      query: query,
      location: 'asia-southeast2',
    };

    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    const filterResult = [];

    rows.forEach((row) => {
      let imageUrl;
    if (row.brand == 'hanasui') {
      imageUrl =  'https://hanasui.id/front-end/assets/img/product_image/bf83c7d933d5f63108fb3b2c327f8cf3.png'
    }
    if (row.brand == 'emina') {
      imageUrl = 'https://www.eminacosmetics.com/cfind/source/thumb/images/product/creamy-tint/cover_w322_h_creamy-tint---wild-berry---with-swatch.png'   
    }
    if (row.brand == 'pixy') {
      imageUrl = 'https://www.pixy.co.id/lib/images/product/PIXY20Lip20Cream20-20Chic20Rose.png'
    }
    if (row.brand == 'somethinc') {
      imaeUrl = 'https://images.somethinc.com/uploads/products/thumbs/800x800/WEB_Bond.jpg'
    }
    if (row.brand == 'wardah') {
      imageUrl = 'https://d2jlkn4m127vak.cloudfront.net/medias/products/variant-1581585309.png'
    }
    if (row.brand == 'maybelline') {
      imageUrl = 'https://www.maybelline.com/-/media/project/loreal/brand-sites/mny/americas/us/lips-makeup/lipstick/superstay-24-liquid-lipstick/maybelline-lip-color-super-stay-24-everlasting-wine-041554237726-o.jpg?rev=c244cf0a6c554169b608a76a12d16c5e&cx=0&cy=0&cw=760&ch=1130&hash=917485440270CED41DC5B10E9FECE8A2'
    }
      filterResult.push({
      "Image": imageUrl,
      "Brand": row.brand,
      "Product Title": row.product_title,
      "Variant Name" : row.variant_name,
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
    return filterResult;
  };


module.exports = { getAllProduct, filteredProduct }