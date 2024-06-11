const { BigQuery } = require('@google-cloud/bigquery');
const projectId = 'capstone-project-foundie';

const bigquery = new BigQuery({
  projectId,
});

async function getAllProduct(){
  const query = `SELECT *
  FROM \`capstone-project-foundie.all_products.data\``;
  const options = {
    query: query,
    location: 'asia-southeast2',
  };

  const [job] = await bigquery.createQueryJob(options);
  const [rows] = await job.getQueryResults();
  const allProduct = [];

  rows.forEach((row) => {
    // let imageUrl;
    // if (row.brand == 'hanasui') {
    //   imageUrl =  ''
    // }
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
    `;
    const options = {
      query: query,
      location: 'asia-southeast2',
    };

    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    const filterResult = [];

    rows.forEach((row) => {
      filterResult.push({
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