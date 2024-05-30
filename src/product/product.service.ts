// product.service.ts

import { Injectable } from '@nestjs/common';
import { CreateProductDto } from '../type/product.type';
import * as admin from 'firebase-admin';

@Injectable()
export class ProductService {
  private db = admin.firestore();
  private storage = admin.storage();

  async create(
    createProductDto: CreateProductDto,
    imageFile: Express.Multer.File,
  ) {
    try {
      const productRef = this.db.collection('products').doc();
      const bucket = this.storage.bucket();
      const fileName = `makeup_products/${Date.now()}_${imageFile.originalname}`;
      const file = bucket.file(fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: imageFile.mimetype,
        },
      });

      stream.write(imageFile.buffer);
      stream.end();

      let imageUrl;
      await stream.on('finish', async () => {
        const signedUrls = await file.getSignedUrl({
          action: 'read',
          expires: '03-09-2491',
        });
        imageUrl = signedUrls[0];

        const productData = {
          ...createProductDto,
          imageUrl: imageUrl,
        };

        await productRef.set(productData);
      });

      return {
        status: 'success',
        message: 'Product successfully created',
        documentName: productRef.id,
        data: {
          id: productRef.id,
          ...createProductDto,
          imageUrl: imageUrl, // Include imageUrl in the response
          error: false,
        },
      };
    } catch (error) {
      console.error('Error creating product: ', error);
      // Return the error message in the response
      return {
        status: 'error',
        message: 'Error creating product',
        error: error.message,
      };
    }
  }
}
