import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { switchMap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
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
  ): Observable<{
    status: HttpStatus;
    error: boolean;
    data: {
      predicted_class: string;
      message: string;
    };
  }> {
    const formData = new FormData();
    formData.append('image', image, 'face.jpg');

    return this.httpService
      .post(`${process.env.URL_FACE_CLASSIFICATION}/predict/face`, formData, {
        headers: formData.getHeaders(),
      })
      .pipe(
        switchMap((response) => {
          // Menggunakan 'predicted_class' dari respons API
          const { predicted_class } = response.data;
          // Membuat pesan berdasarkan 'predicted_class'
          const message = `Jenis klasifikasi wajah Anda adalah ${predicted_class}`;
          return this.savePredictionToFirebase(email, {
            prediction: predicted_class,
            message: message,
            type: 'face classification',
          }).then(() => {
            return {
              status: HttpStatus.OK,
              error: false,
              data: {
                predicted_class: predicted_class,
                message: message,
              },
            };
          });
        }),
        catchError((error) => {
          console.log(error);
          return throwError(
            new HttpException(
              {
                status:
                  error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                message:
                  error.response?.data?.message ||
                  'An error occurred during the API request',
                error: true,
              },
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }),
      );
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
