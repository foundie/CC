/* eslint-disable @typescript-eslint/no-var-requires */
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as multer from 'multer';

dotenv.config();

// Inisialisasi Firebase
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Konfigurasi Multer untuk menangani file yang diunggah
  const upload = multer();
  app.use(upload.single('image'));

  await app.listen(3000);
}
bootstrap();
