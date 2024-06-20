const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) =>
    rl.question(query, (answer) => resolve(answer)),
  );
}

async function getBrightness() {
  const brightnessLevels = ['1 (Lightest)', '2', '3', '4', '5 (Darkest)'];
  const userChoice = parseInt(
    await askQuestion(
      `Choose your brightness level (1-5): ${brightnessLevels.join(', ')}: `,
    ),
  );
  const brightnessPercentage = (6 - userChoice) * 20; // Convert choice to percentage
  return brightnessPercentage;
}

async function getWarmCoolPreference() {
  let warmCount = 0;
  let coolCount = 0;

  const colorPairs = ['Blue', 'Yellow', 'Green', 'Pink', 'Brown'];
  for (const color of colorPairs) {
    const userChoice = parseInt(
      await askQuestion(`For ${color}, do you prefer 0 (Warm) or 1 (Cool)? `),
    );
    if (userChoice === 0) {
      warmCount += 1;
    } else if (userChoice === 1) {
      coolCount += 1;
    }
  }

  const warmPercentage = (warmCount / colorPairs.length) * 100;
  const coolPercentage = (coolCount / colorPairs.length) * 100;
  return { warmPercentage, coolPercentage };
}

async function getClarity() {
  const clarityLevels = ['1 (Brightest)', '2', '3', '4', '5 (Muted)'];
  const userChoice = parseInt(
    await askQuestion(
      `Choose your clarity level (1-5): ${clarityLevels.join(', ')}: `,
    ),
  );
  const clarityPercentage = (6 - userChoice) * 20; // Convert choice to percentage
  return clarityPercentage;
}

function determineCharacteristics(
  brightness,
  warmPercentage,
  coolPercentage,
  clarity,
) {
  const characteristics = {
    light: brightness,
    dark: 100 - brightness,
    warm: warmPercentage,
    cool: coolPercentage,
    bright: clarity,
    muted: 100 - clarity,
  };

  const dominant = Object.keys(characteristics).reduce((a, b) =>
    characteristics[a] > characteristics[b] ? a : b,
  );
  let secondary = Object.keys(characteristics)
    .filter((k) => k !== dominant)
    .reduce((a, b) => (characteristics[a] > characteristics[b] ? a : b));

  if (
    ['warm', 'cool'].includes(dominant) &&
    ['muted', 'bright'].includes(secondary)
  ) {
    secondary = Object.keys(characteristics)
      .filter((k) => k !== dominant && !['muted', 'bright'].includes(k))
      .reduce((a, b) => (characteristics[a] > characteristics[b] ? a : b));
  }

  return { dominant, secondary, characteristics };
}

function determineColorSeason(dominant, secondary, characteristics) {
  const colorSeason = {
    'dark,warm': 'Autumn Deep',
    'dark,cool': 'Winter Deep',
    'light,warm': 'Spring Light',
    'light,cool': 'Summer Light',
    'muted,warm': 'Autumn Soft',
    'muted,cool': 'Summer Soft',
    'bright,warm': 'Spring Clear',
    'bright,cool': 'Winter Clear',
    'warm,muted': 'Autumn Warm',
    'warm,bright': 'Spring Warm',
    'cool,muted': 'Summer Cool',
    'cool,bright': 'Winter Cool',
  };

  const seasonDescriptions = {
    'Autumn Deep':
      'Tips for Choosing Colors: Opt for rich, warm, and intense shades like deep forest greens, burgundy, and warm browns. Jewelry: Choose gold and copper jewelry to complement your warm tones. Hair Colors: Dark brown, auburn, or deep red shades work best. Lipstick Colors: Look for warm, deep shades like brick red or terracotta.',
    'Winter Deep':
      'Tips for Choosing Colors: Go for bold, cool colors with high contrast, such as deep blues, blacks, and intense jewel tones. Jewelry: Silver, platinum, and white gold suit your cool tones. Hair Colors: Black, dark brown, or cool-toned highlights. Lipstick Colors: Opt for deep, cool shades like berry or wine.',
    'Spring Light':
      'Tips for Choosing Colors: Select warm, fresh colors with a bright, pastel quality, like light yellows, peachy pinks, and soft greens. Jewelry: Gold and rose gold pieces enhance your warm undertones. Hair Colors: Light blonde, strawberry blonde, or light brown. Lipstick Colors: Choose warm, soft shades like peach or coral.',
    'Summer Light':
      'Tips for Choosing Colors: Choose cool, muted colors with a soft, airy feel, such as pastel blues, lavenders, and light grays. Jewelry: Silver and white gold jewelry complement your cool tones. Hair Colors: Ash blonde, light brown, or cool-toned highlights. Lipstick Colors: Opt for cool, light shades like soft pink or mauve.',
    'Autumn Soft':
      'Tips for Choosing Colors: Opt for warm, gentle colors with an earthy feel, like soft olive greens, warm beiges, and muted oranges. Jewelry: Gold and copper pieces enhance your warm undertones. Hair Colors: Warm brown, auburn, or caramel highlights. Lipstick Colors: Choose warm, muted shades like soft terracotta or warm nude.',
    'Summer Soft':
      'Tips for Choosing Colors: Select cool, subdued colors with a misty quality, like muted blues, dusty roses, and soft lavenders. Jewelry: Silver and white gold pieces suit your cool tones. Hair Colors: Ash blonde, light brown, or cool-toned highlights. Lipstick Colors: Opt for cool, soft shades like rose or soft berry.',
    'Spring Clear':
      'Tips for Choosing Colors: Go for bright, warm colors with a clear, crisp quality, such as bright coral, turquoise, and clear yellows. Jewelry: Gold and rose gold pieces complement your warm tones. Hair Colors: Bright blonde, golden brown, or warm highlights. Lipstick Colors: Choose bright, warm shades like coral or peach.',
    'Winter Clear':
      'Tips for Choosing Colors: Select vibrant, cool colors with high contrast, like bright reds, icy blues, and stark whites. Jewelry: Silver, platinum, and white gold suit your cool tones. Hair Colors: Black, dark brown, or cool-toned highlights. Lipstick Colors: Opt for bright, cool shades like red or fuchsia.',
    'Autumn Warm':
      'Tips for Choosing Colors: Opt for earthy, golden shades like golden yellows, rich browns, and warm olive greens. Jewelry: Gold and copper pieces enhance your warm undertones. Hair Colors: Warm brown, auburn, or golden highlights. Lipstick Colors: Choose warm shades like golden brown or warm red.',
    'Spring Warm':
      'Tips for Choosing Colors: Go for sunny, lively colors like warm pinks, peachy tones, and fresh greens. Jewelry: Gold and rose gold pieces complement your warm tones. Hair Colors: Bright blonde, strawberry blonde, or warm highlights. Lipstick Colors: Choose bright, warm shades like coral or peach.',
    'Summer Cool':
      'Tips for Choosing Colors: Select serene, calm colors like cool blues, soft pinks, and muted purples. Jewelry: Silver and white gold pieces suit your cool tones. Hair Colors: Ash blonde, light brown, or cool-toned highlights. Lipstick Colors: Opt for cool, soft shades like rose or soft berry.',
    'Winter Cool':
      'Tips for Choosing Colors: Choose striking, icy colors like crisp whites, deep navy, and cool reds. Jewelry: Silver, platinum, and white gold suit your cool tones. Hair Colors: Black, dark brown, or cool-toned highlights. Lipstick Colors: Opt for bright, cool shades like red or fuchsia.',
  };

  const seasonPalettes = {
    'Autumn Deep': [
      '#BE9B64',
      '#B59A48',
      '#AE6036',
      '#996848',
      '#BCB29E',
      '#8C8F8D',
      '#6C2831',
      '#BB4A4D',
      '#61234A',
      '#A3497C',
      '#12574A',
      '#578270',
    ],
    'Winter Deep': [
      '#F4F7FF',
      '#E0DDD7',
      '#F0E79D',
      '#262735',
      '#1E3A3C',
      '#2A2B2E',
      '#9F2436',
      '#CE3D66',
      '#B085B7',
      '#502E55',
      '#266691',
      '#40A48E',
    ],
    'Spring Light': [
      '#EFDCC3',
      '#CBC3B7',
      '#F4E87A',
      '#F4C3C4',
      '#AFA4CE',
      '#BED38E',
      '#685A4E',
      '#F7C46C',
      '#EA6676',
      '#3686A0',
      '#0E9D76',
      '#9AD4EA',
    ],
    'Summer Light': [
      '#E8E4DA',
      '#A89C94',
      '#5D3C43',
      '#FF8D94',
      '#F18AAD',
      '#BD4275',
      '#94B2DF',
      '#36629F',
      '#1B7F8E',
      '#63DBBF',
      '#1A9E74',
      '#2A675C',
    ],
    'Autumn Soft': [
      '#BAA596',
      '#A7A781',
      '#56584C',
      '#C3BDAB',
      '#B44E5D',
      '#782A39',
      '#FDC3C6',
      '#D77E70',
      '#29495C',
      '#7BA0C0',
      '#437D6D',
      '#405E5C',
    ],
    'Summer Soft': [
      '#F4C6C3',
      '#DBDDD1',
      '#ABAFAE',
      '#A76E7A',
      '#978D89',
      '#62617E',
      '#DCD8A8',
      '#AAADC2',
      '#619187',
      '#413E3D',
      '#353A4C',
      '#274E55',
    ],
    'Spring Clear': [
      '#F1AB45',
      '#F0EADA',
      '#DA3C58',
      '#83776B',
      '#4D4C48',
      '#18406B',
      '#DF88B8',
      '#B93B33',
      '#C7E67A',
      '#59C9D5',
      '#395589',
      '#10877F',
    ],
    'Winter Clear': [
      '#F7D1D1',
      '#B8E2DC',
      '#F5D6E6',
      '#D94F71',
      '#AB3475',
      '#8C3573',
      '#5A5B9F',
      '#2DA8D8',
      '#00698B',
      '#4E4B51',
      '#373838',
      '#2B3042',
    ],
    'Autumn Warm': [
      '#DC793E',
      '#BE4B3B',
      '#8D3F2D',
      '#8A7963',
      '#80856D',
      '#46483D',
      '#C2C18D',
      '#67592A',
      '#434237',
      '#5BACC3',
      '#20706F',
      '#097988',
    ],
    'Spring Warm': [
      '#FADD85',
      '#EFC05A',
      '#E9897E',
      '#E9685A',
      '#DE3847',
      '#704F36',
      '#A3BBDF',
      '#5086C3',
      '#1F4477',
      '#C8D77E',
      '#5F843C',
      '#017557',
    ],
    'Summer Cool': [
      '#E9738D',
      '#99AEAE',
      '#99888D',
      '#697A7E',
      '#646093',
      '#48457A',
      '#918C86',
      '#73606A',
      '#62BBC5',
      '#226C63',
      '#1F6680',
      '#16525A',
    ],
    'Winter Cool': [
      '#F3D4DF',
      '#D2CFC4',
      '#BCD9C8',
      '#DA6CA1',
      '#AC5D98',
      '#642B60',
      '#4A5FA5',
      '#2A6A8B',
      '#009B8C',
      '#544275',
      '#4E3E3A',
      '#392C2B',
    ],
  };

  const seasonScores = {
    'Autumn Deep': 0,
    'Winter Deep': 0,
    'Spring Light': 0,
    'Summer Light': 0,
    'Autumn Soft': 0,
    'Summer Soft': 0,
    'Spring Clear': 0,
    'Winter Clear': 0,
    'Autumn Warm': 0,
    'Spring Warm': 0,
    'Summer Cool': 0,
    'Winter Cool': 0,
  };

  for (const [key, season] of Object.entries(colorSeason)) {
    const [dom, sec] = key.split(',');
    seasonScores[season] +=
      characteristics[dom] * 0.6 + characteristics[sec] * 0.4;
  }

  const totalScore = Object.values(seasonScores).reduce((a, b) => a + b, 0);
  const seasonPercentages = {};
  for (const [season, score] of Object.entries(seasonScores)) {
    seasonPercentages[season] = Math.round((score / totalScore) * 100);
  }

  const season = Object.keys(seasonScores).reduce((a, b) =>
    seasonScores[a] > seasonScores[b] ? a : b,
  );

  return {
    season,
    seasonPercentages,
    description: seasonDescriptions[season],
    palette: seasonPalettes[season],
  };
}

async function colorAnalysisRecommender() {
  console.log('Welcome to the Color Analysis Recommender System!');

  const brightness = await getBrightness();
  const { warmPercentage, coolPercentage } = await getWarmCoolPreference();
  const clarity = await getClarity();

  const { dominant, secondary, characteristics } = determineCharacteristics(
    brightness,
    warmPercentage,
    coolPercentage,
    clarity,
  );
  const { season, seasonPercentages, description, palette } =
    determineColorSeason(dominant, secondary, characteristics);

  console.log(`Your dominant characteristic is: ${dominant}`);
  console.log(`Your secondary characteristic is: ${secondary}`);
  console.log(`Your color season is: ${season}`);
  console.log(`Description: ${description}`);
  console.log(`Color Palette: ${palette.join(', ')}`);
  console.log(
    `Season compatibility percentages: ${JSON.stringify(seasonPercentages, null, 2)}`,
  );

  rl.close();
}

// Run the recommender system
colorAnalysisRecommender();
