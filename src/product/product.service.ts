import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import * as FormData from 'form-data';

@Injectable()
export class ProductService {
  constructor(private httpService: HttpService) {}

  predictProductFilter(name: string, season: string): Observable<any> {
    // Perhatikan bahwa tipe kembaliannya sekarang adalah Observable<any>
    const formData = new FormData();
    formData.append('name', name);
    formData.append('season', season);

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
}
