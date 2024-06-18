const csv = require('csv-parser');
const skmeans = require('skmeans');
const { Storage } = require('@google-cloud/storage');
const results = [];

const storage = new Storage({
  projectId: 'capstone-project-foundie'
});

const bucketName = 'storage-foundie';
const fileName = 'data/products/foundie_data_products.csv';

const readFileFromGCS = async () => {
  return new Promise((resolve, reject) => {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    const readStream = file.createReadStream();

    readStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const toneMapping = {'dark_deep': 3, 'medium_tan': 2, 'fair_light': 1};
        const seasonMapping = {
          'autumn warm': 1, 'autumn soft': 2, 'autumn deep': 3,
          'summer soft': 4, 'summer cool': 5, 'summer light': 6,
          'spring warm': 7, 'spring light': 8, 'spring clear': 9,
          'winter deep': 10, 'winter clear': 11, 'winter cool': 12
        };
        const typeMapping = {'lip': 1, 'face': 2, 'foundation & cussion': 3, 'cheek': 4, 'powder': 5, 'eye': 6};

        results.forEach(row => {
          row['Tone'] = toneMapping[row['Tone']];
          row['Season 1 Name'] = seasonMapping[row['Season 1 Name']];
          row['Type'] = typeMapping[row['Type']];
        });

        const cleanResults = results.filter(row => row['Tone'] && row['Season 1 Name'] && row['Shade'] && row['Type']);
        resolve(cleanResults);
      })
      .on('error', reject);
  });
};

const showProductsDetailsByBrand = (data, selectedIndex, nClusters = 60, topN = 10) => {
  if (selectedIndex < 0 || selectedIndex >= data.length) {
    throw new Error(`Indeks ${selectedIndex} tidak valid.`);
  }

  const referenceProduct = data[selectedIndex];
  const features = data.map(row => [parseFloat(row['Shade']), row['Tone'], row['Season 1 Name'], row['Type']]);

  const kmeansResult = skmeans(features, nClusters);
  const clusters = kmeansResult.idxs;

  data.forEach((row, index) => row['Cluster'] = clusters[index]);

  const clusterLabel = data[selectedIndex]['Cluster'];
  const similarProducts = data.filter(row => row['Cluster'] === clusterLabel);

  const referenceFeatures = features[selectedIndex];
  const similarities = similarProducts.map(product => {
    const productFeatures = features[data.indexOf(product)];
    const distance = Math.sqrt(referenceFeatures.reduce((sum, val, i) => sum + Math.pow(val - productFeatures[i], 2), 0));
    const similarity = 1 / (1 + distance);

    return {
      "Brand": product['Brand'],
      "Product Title": product['Product Title'],
      "Type": product['Type'],
      "Variant Name": product['Variant Name'],
      "Shade": product['Shade'],
      "Tone": product['Tone'],
      "Color HEX": product['Color HEX'],
      "Season 1 Name": product['Season 1 Name'],
      "Similarity": similarity
    };
  });

  similarities.sort((a, b) => b['Similarity'] - a['Similarity']);

  const topSimilarities = [];
  const brandCounts = {};
  similarities.slice(0, topN).forEach(similarity => {
    if (!brandCounts[similarity.Brand]) {
      brandCounts[similarity.Brand] = 0;
    }
    brandCounts[similarity.Brand]++;
    topSimilarities.push(similarity);
  });

  return { topSimilarities, brandCounts, referenceProduct };
};

module.exports = { readFileFromGCS, showProductsDetailsByBrand };