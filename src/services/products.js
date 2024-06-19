const { BigQuery } = require('@google-cloud/bigquery');
const projectId = 'capstone-project-foundie';

const bigquery = new BigQuery({
  projectId,
});

async function getAllProduct(limit, skip){
    limit = parseInt(limit, 10);
    skip = parseInt(skip, 10);

    // Validasi nilai yang diberikan oleh user
    if (isNaN(limit) || limit <= 0) {
        limit = undefined; // Tidak memberikan nilai default
    }

    if (isNaN(skip) || skip < 0) {
        skip = undefined; // Tidak memberikan nilai default
    }

    // Buat query SQL sesuai dengan input user
    let query = 'SELECT * FROM `capstone-project-foundie.all_products.data`';

    if (limit !== undefined && skip !== undefined) {
        query += ` LIMIT ${limit} OFFSET ${skip}`;
    } else if (limit !== undefined) {
        query += ` LIMIT ${limit}`;
    } else if (skip !== undefined) {
        query += ` OFFSET ${skip}`;
    }
  const options = {
    query: query,
    location: 'asia-southeast2',
  };

  const [job] = await bigquery.createQueryJob(options);
  const [rows] = await job.getQueryResults();
  const allProduct = [];

  rows.forEach((row) => {
    allProduct.push({
      "Image": row.image_url,
      "Brand": row.brand,
      "Product Title": row.product_title,
      "Variant Name" : row.variant_name,
      "Type": row.type,
      "Shade": row.shade,
      "Tone": row.tone,
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

function capitalizeFirstLetter(string) {
  return string.split(' ')
  .map(word => word.charAt(0)
  .toUpperCase() 
  + word.slice(1)
  .toLowerCase()).join(' ');
}
async function filteredProduct(name) {
  name = name ? capitalizeFirstLetter(name) : name;
    let query = `
    SELECT *
    FROM \`capstone-project-foundie.all_products.data\`
    WHERE TRUE`;
    if (name) {
        query += ` AND \`product_title\` LIKE '%${name}%'`;
    }

    const options = {
      query: query,
      location: 'asia-southeast2',
    };

    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    const filterResult = [];

    rows.forEach((row) => {
      filterResult.push({
      "Index": row.Index,
      "Image": row.image_url,
      "Brand": row.brand,
      "Product Title": row.product_title,
      "Variant Name" : row.variant_name,
      "Type": row.type,
      "Shade": row.shade,
      "Tone": row.tone,
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