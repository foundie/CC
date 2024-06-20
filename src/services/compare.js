const csv = require('csv-parser');
const skmeans = require('skmeans');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: 'capstone-project-foundie'
});

const bucketName = 'storage-foundie';
const fileName = 'data/products/updated_index.csv';

const readFileFromGCS = async () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    const readStream = file.createReadStream();

    readStream
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        const toneMapping = {'dark_deep': 0, 'medium_tan': 2, 'fair_light': 1};
        const seasonMapping = {
          'autumn warm': 1, 'autumn soft': 2, 'autumn deep': 3,
          'summer soft': 4, 'summer cool': 5, 'summer light': 6,
          'spring warm': 7, 'spring light': 8, 'spring clear': 9,
          'winter deep': 10, 'winter clear': 11, 'winter cool': 12
        };
        const typeMapping = {'lip': 1, 'face': 2, 'foundation & cussion': 3, 'cheek': 4, 'powder': 5, 'eye': 6};

        const reverseToneMapping = Object.keys(toneMapping).reduce((obj, key) => {
          obj[toneMapping[key]] = key;
          return obj;
        }, {});
        const reverseSeasonMapping = Object.keys(seasonMapping).reduce((obj, key) => {
          obj[seasonMapping[key]] = key;
          return obj;
        }, {});
        const reverseTypeMapping = Object.keys(typeMapping).reduce((obj, key) => {
          obj[typeMapping[key]] = key;
          return obj;
        }, {});

        results.forEach(row => {
          row['Tone'] = toneMapping[row['Tone']] || 'Unknown Tone';
          row['Season 1 Name'] = seasonMapping[row['Season 1 Name']] || 'Unknown Season';
          row['Type'] = typeMapping[row['Type']] || 'Unknown Type';
        });

        const cleanResults = results.filter(row => row['Tone'] && row['Season 1 Name'] && row['Shade'] && row['Type']);
        resolve({ cleanResults, reverseToneMapping, reverseSeasonMapping, reverseTypeMapping });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const showProductsDetailsByBrand = (data, selectedIndex, reverseToneMapping, reverseSeasonMapping, reverseTypeMapping, nClusters = 60, topN = 10) => {
  if (selectedIndex < 0 || selectedIndex >= data.length) {
    throw new Error(`Indeks ${selectedIndex} tidak valid.`);
  }

  const referenceProduct = data[selectedIndex];
  const features = data.map(row => {
    const shade = parseFloat(row['Shade']);
    const tone = row['Tone'];
    const season = row['Season 1 Name'];
    const type = row['Type'];

    if (isNaN(shade) || tone === undefined || season === undefined || type === undefined) {
      throw new Error('Data tidak valid ditemukan dalam proses clustering.');
    }

    return [shade, tone, season, type];
  });

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
      "Image": product['Image URL'],
      "Brand": product['Brand'],
      "Product Title": product['Product Title'],
      "Type": reverseTypeMapping[product['Type']],
      "Variant Name": product['Variant Name'],
      "Shade": product['Shade'],
      "Tone": reverseToneMapping[product['Tone']],
      "Color HEX": product['Color HEX'],
      "Season 1 Name": reverseSeasonMapping[product['Season 1 Name']],
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