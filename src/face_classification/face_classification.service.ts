/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { switchMap, catchError } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import * as FormData from 'form-data';
import { config } from 'dotenv';
import * as admin from 'firebase-admin';

config();

@Injectable()
export class Face_classificationService {
  constructor(private httpService: HttpService) {}

  async predictFace(
    email: string,
    image: Buffer,
  ): Promise<{
    status: HttpStatus;
    error: boolean;
    data?: {
      predicted_class: string;
      message: string;
    };
  }> {
    const formData = new FormData();
    formData.append('image', image, 'face.jpg');

    try {
      const response = await this.httpService
        .post(`${process.env.URL_FACE_CLASSIFICATION}/predict/face`, formData, {
          headers: formData.getHeaders(),
        })
        .toPromise();

      const predicted_class =
        response.data.predicted_class || 'tidak terdeteksi';
      const message =
        predicted_class === 'tidak terdeteksi'
          ? 'Tidak terdeteksi wajah'
          : `Jenis klasifikasi wajah Anda adalah ${predicted_class}`;

      await this.savePredictionToFirebase(email, {
        prediction: predicted_class,
        message: message,
        type: 'face classification',
      });

      return {
        status: HttpStatus.OK,
        error: false,
        data: {
          predicted_class: predicted_class,
          message: message,
        },
      };
    } catch (error) {
      await this.savePredictionToFirebase(email, {
        prediction: 'tidak terdeteksi',
        message: 'Tidak terdeteksi wajah',
        type: 'face classification',
      });

      return {
        status: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error: true,
        data: {
          predicted_class: 'tidak terdeteksi',
          message: 'Tidak terdeteksi wajah',
        },
      };
    }
  }

  private async savePredictionToFirebase(
    email: string,
    predictionData: { prediction: string; message: string; type: string },
  ) {
    const docId = `${email}_${predictionData.type}`;
    const historyRef = admin.firestore().collection('histori').doc(docId);
    await historyRef.set(
      {
        email,
        ...predictionData,
      },
      { merge: true },
    );
  }
}
