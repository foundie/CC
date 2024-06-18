const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getBrightness() {
  const brightnessLevels = ["1 (Lightest)", "2", "3", "4", "5 (Darkest)"];
  return new Promise((resolve) => {
    rl.question(`Choose your brightness level (1-5): ${brightnessLevels.join(', ')}: `, (answer) => {
      const userChoice = parseInt(answer);
      const brightnessPercentage = (6 - userChoice) * 20; // Convert choice to percentage
      resolve(brightnessPercentage);
    });
  });
}

function getWarmCoolPreference() {
  const colorPairs = ["Blue", "Yellow", "Green", "Pink", "Brown"];
  let warmCount = 0;
  let coolCount = 0;

  return new Promise((resolve) => {
    const askPreference = (index) => {
      if (index < colorPairs.length) {
        rl.question(`For ${colorPairs[index]}, do you prefer 0 (Warm) or 1 (Cool)?: `, (answer) => {
          const userChoice = parseInt(answer);
          if (userChoice === 0) {
            warmCount += 1;
          } else if (userChoice === 1) {
            coolCount += 1;
          }
          askPreference(index + 1);
        });
      } else {
        const warmPercentage = (warmCount / colorPairs.length) * 100;
        const coolPercentage = (coolCount / colorPairs.length) * 100;
        resolve({ warmPercentage, coolPercentage });
      }
    };
    askPreference(0);
  });
}

function getClarity() {
  const clarityLevels = ["1 (Brightest)", "2", "3", "4", "5 (Muted)"];
  return new Promise((resolve) => {
    rl.question(`Choose your clarity level (1-5): ${clarityLevels.join(', ')}: `, (answer) => {
      const userChoice = parseInt(answer);
      const clarityPercentage = (6 - userChoice) * 20; // Convert choice to percentage
      resolve(clarityPercentage);
    });
  });
}

function determineCharacteristics(brightness, warmPercentage, coolPercentage, clarity) {
  const characteristics = {
    light: brightness,
    dark: 100 - brightness,
    warm: warmPercentage,
    cool: coolPercentage,
    bright: clarity,
    muted: 100 - clarity
  };

  const dominant = Object.keys(characteristics).reduce((a, b) => characteristics[a] > characteristics[b] ? a : b);
  let secondary = Object.keys(characteristics).filter(k => k !== dominant).reduce((a, b) => characteristics[a] > characteristics[b] ? a : b);

  if (["warm", "cool"].includes(dominant) && ["muted", "bright"].includes(secondary)) {
    secondary = Object.keys(characteristics).filter(k => k !== dominant && !["muted", "bright"].includes(k)).reduce((a, b) => characteristics[a] > characteristics[b] ? a : b);
  }

  return { dominant, secondary, characteristics };
}

function determineColorSeason(dominant, secondary, characteristics) {
  const colorSeason = {
    "dark,warm": "Autumn Deep",
    "dark,cool": "Winter Deep",
    "light,warm": "Spring Light",
    "light,cool": "Summer Light",
    "muted,warm": "Autumn Soft",
    "muted,cool": "Summer Soft",
    "bright,warm": "Spring Clear",
    "bright,cool": "Winter Clear",
    "warm,muted": "Autumn Warm",
    "warm,bright": "Spring Warm",
    "cool,muted": "Summer Cool",
    "cool,bright": "Winter Cool"
  };

  const seasonScores = {
    "Autumn Deep": 0,
    "Winter Deep": 0,
    "Spring Light": 0,
    "Summer Light": 0,
    "Autumn Soft": 0,
    "Summer Soft": 0,
    "Spring Clear": 0,
    "Winter Clear": 0,
    "Autumn Warm": 0,
    "Spring Warm": 0,
    "Summer Cool": 0,
    "Winter Cool": 0
  };

  for (const [key, season] of Object.entries(colorSeason)) {
    const [dom, sec] = key.split(",");
    seasonScores[season] += characteristics[dom] * 0.6 + characteristics[sec] * 0.4;
  }

  const totalScore = Object.values(seasonScores).reduce((a, b) => a + b, 0);
  const seasonPercentages = {};
  for (const [season, score] of Object.entries(seasonScores)) {
    seasonPercentages[season] = Math.round((score / totalScore) * 100);
  }

  const season = Object.keys(seasonScores).reduce((a, b) => seasonScores[a] > seasonScores[b] ? a : b);

  return { season, seasonPercentages };
}

async function colorAnalysisRecommender() {
  console.log("Welcome to the Color Analysis Recommender System!");

  const brightness = await getBrightness();
  const { warmPercentage, coolPercentage } = await getWarmCoolPreference();
  const clarity = await getClarity();

  const { dominant, secondary, characteristics } = determineCharacteristics(brightness, warmPercentage, coolPercentage, clarity);
  const { season, seasonPercentages } = determineColorSeason(dominant, secondary, characteristics);

  console.log(`Your dominant characteristic is: ${dominant}`);
  console.log(`Your secondary characteristic is: ${secondary}`);
  console.log(`Your color season is: ${season}`);
  console.log(`Season compatibility percentages: ${JSON.stringify(seasonPercentages, null, 2)}`);

  rl.close();
}

// Run the recommender system
colorAnalysisRecommender();