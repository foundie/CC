import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { switchMap, catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import * as FormData from 'form-data';
import * as admin from 'firebase-admin';

@Injectable()
export class SkinToneService {
  constructor(private httpService: HttpService) {}

  predictSkinTone(
    email: string,
    image: Buffer,
  ): Observable<{ result: string; message: string; products: any[] }> {
    const formData = new FormData();
    formData.append('image', image, 'face.jpg');

    return this.httpService
      .post(`${process.env.URL_HAPI}/predict/skin`, formData, {
        headers: formData.getHeaders(),
      })
      .pipe(
        switchMap((response) => {
          const { result, message, product } = response.data;
          this.savePredictionToFirebase(email, {
            result,
            message,
            type: 'skin tone',
            products: product,
          });
          return of({
            status: HttpStatus.OK,
            error: false,
            result,
            message,
            products: product,
          });
        }),
        catchError((error) => {
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

  async getUserHistory(email: string): Promise<{
    status: number;
    error: boolean;
    message: string;
    data?: any[];
  }> {
    const historyRef = admin.firestore().collection('histori');
    const snapshot = await historyRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return {
        status: HttpStatus.NOT_FOUND,
        error: true,
        message: 'No history records found for the provided email.',
      };
    }

    const userHistory = snapshot.docs.map((doc) => doc.data());
    return {
      status: HttpStatus.OK,
      error: false,
      message: 'History records retrieved successfully.',
      data: userHistory,
    };
  }

  private async savePredictionToFirebase(
    email: string,
    predictionData: {
      result: string;
      message: string;
      type: string;
      products: any[];
    },
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
