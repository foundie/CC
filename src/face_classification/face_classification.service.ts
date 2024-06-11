import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as FormData from 'form-data';
import { config } from 'dotenv';
import * as admin from 'firebase-admin';

config();

@Injectable()
export class Face_classificationService {
  constructor(private httpService: HttpService) {}

  predictFace(
    email: string,
    image: Buffer,
  ): Observable<{ prediction: string; message: string }> {
    const formData = new FormData();
    formData.append('image', image, 'face.jpg');

    return this.httpService
      .post(`${process.env.URL_HAPI}/predict/face`, formData, {
        headers: formData.getHeaders(),
      })
      .pipe(
        switchMap((response) => {
          const { prediction, message } = response.data;
          return this.savePredictionToFirebase(email, {
            prediction,
            message,
            type: 'face classification',
          }).then(() => {
            return { prediction, message };
          });
        }),
      );
  }

  private async savePredictionToFirebase(
    email: string,
    predictionData: { prediction: string; message: string; type: string },
  ) {
    const historyRef = admin.firestore().collection('histori').doc();
    await historyRef.set({
      email,
      ...predictionData,
    });
  }
}
