import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterService {
  private db = admin.firestore();
  private storage = admin.storage();

  async register(name: string, email: string, password: string) {
    const userDoc = await this.db.collection('users').doc(email).get();
    if (userDoc.exists) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'Email already exists',
          error: true,
        },
        HttpStatus.CONFLICT,
      );
    }
    if (!name || !email || !password) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'All fields are required',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (password.length < 8) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Password must be at least 8 characters long',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password: hashedPassword,
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'The email address is already in use by another account.',
          error: true,
        },
        HttpStatus.CONFLICT,
      );
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'user' });
    await this.db.collection('users').doc(email).set({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      followersCount: 0,
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Register successfully',
      error: false,
    };
  }
}
