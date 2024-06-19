import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import * as FormData from 'form-data';

@Injectable()
export class ProductService {
  constructor(private httpService: HttpService) {}

  predictProductFilter(name: string, season?: string): Observable<any> {
    // Tipe kembaliannya adalah Observable<any>
    const formData = new FormData();
    formData.append('name', name);
    // Gunakan string kosong sebagai nilai default jika 'season' tidak ada
    formData.append('season', season || '');

    return this.httpService
      .post(`${process.env.URL_HAPI}/products/filter`, formData, {
        headers: formData.getHeaders(),
      })
      .pipe(
        switchMap((response) => {
          // Langsung mengembalikan data dari respons API
          return of(response.data);
        }),
        catchError((error) => {
          // Tangani kesalahan dan kembalikan HttpException
          return throwError(
            new HttpException(
              {
                status:
                  error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                message:
                  error.response?.data?.message ||
                  'An error occurred during the API request',
              },
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }),
      );
  }

  getProducts(limit?: number, skip?: number): Observable<any> {
    let queryParams = '';
    if (limit !== undefined) {
      queryParams += `?limit=${limit}`;
    }
    if (skip !== undefined) {
      queryParams += limit !== undefined ? `&skip=${skip}` : `?skip=${skip}`;
    }

    return this.httpService
      .get(`${process.env.URL_HAPI}/products${queryParams}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          throw new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              error: 'There was a problem accessing the products API',
              message: error,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      );
  }

  compareProduct(index: number): Observable<any> {
    return this.httpService
      .get(`${process.env.URL_HAPI}/products/compare?index=${index}`)
      .pipe(
        map((response) => {
          // Pastikan untuk menangani respons sesuai dengan struktur yang diharapkan
          if (response.data.error) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error: true,
                message:
                  response.data.message ||
                  'Error occurred during product comparison',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          return response.data;
        }),
        catchError((error) => {
          // Tangani kesalahan yang mungkin terjadi selama permintaan HTTP
          throw new HttpException(
            {
              status:
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
              error: true,
              message:
                error.response?.data?.message ||
                'An error occurred during the API request',
            },
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      );
  }
}
