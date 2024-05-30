// register.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterService {
  private db = admin.firestore();
  private storage = admin.storage();

  async register(name: string, email: string, password: string) {
    const userDoc = await this.db.collection('users').doc(email).get();
    if (userDoc.exists) {
      return {
        status: 'error',
        message: 'Email already exists',
        error: true,
      };
    }
    if (!name || !email || !password) {
      return {
        status: 'error',
        message: 'All fields are required',
        error: true,
      };
    }

    if (password.length < 8) {
      return {
        status: 'error',
        message: 'Password must be at least 8 characters long',
        error: true,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password: hashedPassword,
      });
    } catch (error) {
      return {
        status: 'error',
        message: 'The email address is already in use by another account.',
        error: true,
      };
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'user' });
    await this.db.collection('users').doc(email).set({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    return {
      status: 'ok',
      message: 'Register successfully',
      error: false,
    };
  }
}
