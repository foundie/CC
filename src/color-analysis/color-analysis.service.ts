// color-analysis.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ColorAnalysisDto } from './dto/color-analysis.dto';
import * as admin from 'firebase-admin';
import {
  seasonDescriptions,
  seasonImage,
  seasonPalettes,
} from '../utils/color.data';

@Injectable()
export class ColorAnalysisService {
  private db = admin.firestore();
  // Fungsi untuk mendapatkan kecerahan
  private getBrightness(brightnessLevel: number): number {
    return (6 - brightnessLevel) * 20;
  }

  // Fungsi untuk mendapatkan preferensi warna hangat atau dingin
  private getWarmCoolPreference(dto: ColorAnalysisDto): {
    warmPercentage: number;
    coolPercentage: number;
  } {
    const preferences = [
      dto.bluePreferences,
      dto.yellowPreferences,
      dto.greenPreferences,
      dto.pinkPreferences,
      dto.brownPreferences,
    ];
    let warmCount = preferences.filter((preference) => preference === 0).length;
    let coolCount = preferences.filter((preference) => preference === 1).length;

    const warmPercentage = (warmCount / preferences.length) * 100;
    const coolPercentage = (coolCount / preferences.length) * 100;

    return { warmPercentage, coolPercentage };
  }

  // Fungsi untuk mendapatkan kejernihan
  private getClarity(clarityLevel: number): number {
    return (6 - clarityLevel) * 20;
  }

  // Fungsi untuk menentukan karakteristik dominan dan sekunder
  private determineCharacteristics(
    brightness: number,
    warmPercentage: number,
    coolPercentage: number,
    clarity: number,
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

  // Fungsi untuk menentukan musim warna
  private determineColorSeason(
    dominant: string,
    secondary: string,
    characteristics: any,
  ) {
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

    return { season, seasonPercentages };
  }

  private capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private async saveColorAnalysisHistory(
    email: string,
    colorAnalysisData: {
      dominantCharacteristic: string;
      secondaryCharacteristic: string;
      colorSeason: string;
      seasonCompatibilityPercentages: any;
    },
  ) {
    const docId = `${email}_colorAnalysis`;
    const historyRef = admin.firestore().collection('histori').doc(docId);
    await historyRef.set(
      {
        email,
        ...colorAnalysisData,
        type: 'Color Analysis',
      },
      { merge: true },
    );
  }

  // Fungsi utama untuk melakukan analisis warna
  public async analyzeColor(email: string, colorAnalysisDto: ColorAnalysisDto) {
    // Validasi input
    if (
      !colorAnalysisDto.brightnessLevel ||
      !colorAnalysisDto.clarityLevel ||
      colorAnalysisDto.bluePreferences === undefined ||
      colorAnalysisDto.yellowPreferences === undefined ||
      colorAnalysisDto.greenPreferences === undefined ||
      colorAnalysisDto.pinkPreferences === undefined ||
      colorAnalysisDto.brownPreferences === undefined
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Missing required fields',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      colorAnalysisDto.brightnessLevel < 1 ||
      colorAnalysisDto.brightnessLevel > 5 ||
      colorAnalysisDto.clarityLevel < 1 ||
      colorAnalysisDto.clarityLevel > 5
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Brightness and clarity levels must be between 1 and 5',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const colorPreferences = [
      colorAnalysisDto.bluePreferences,
      colorAnalysisDto.yellowPreferences,
      colorAnalysisDto.greenPreferences,
      colorAnalysisDto.pinkPreferences,
      colorAnalysisDto.brownPreferences,
    ];

    if (
      colorPreferences.some(
        (preference) => preference !== 0 && preference !== 1,
      )
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Color preferences must be 0 or 1',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Proses analisis warna
    try {
      const brightness = this.getBrightness(colorAnalysisDto.brightnessLevel);
      const { warmPercentage, coolPercentage } =
        this.getWarmCoolPreference(colorAnalysisDto);
      const clarity = this.getClarity(colorAnalysisDto.clarityLevel);

      const { dominant, secondary, characteristics } =
        this.determineCharacteristics(
          brightness,
          warmPercentage,
          coolPercentage,
          clarity,
        );
      const { season, seasonPercentages } = this.determineColorSeason(
        dominant,
        secondary,
        characteristics,
      );

      // Mendapatkan URL gambar musim berdasarkan colorSeason
      const seasonImageURL = seasonImage[season];

      // Mendapatkan deskripsi musim berdasarkan colorSeason
      const seasonDescription = seasonDescriptions[season];

      // Mendapatkan palet warna musim berdasarkan colorSeason
      const seasonPalette = seasonPalettes[season];

      const analysisResult = {
        status: HttpStatus.OK,
        message: 'Color analysis successfully completed',
        data: {
          dominantCharacteristic: this.capitalizeFirstLetter(dominant),
          secondaryCharacteristic: this.capitalizeFirstLetter(secondary),
          colorSeason: this.capitalizeFirstLetter(season),
          seasonCompatibilityPercentages: seasonPercentages,
          description: seasonDescription,
          seasonImage: seasonImageURL,
          palette: seasonPalette,
          type: 'Color Analysis',
        },
        error: false,
      };

      // Menyimpan hasil analisis ke Firebase
      await this.saveColorAnalysisHistory(email, analysisResult.data);

      // Return hasil analisis
      return analysisResult;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error processing color analysis',
          error: true,
          reason: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
