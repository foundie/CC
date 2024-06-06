// auth.service
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  private failedLoginAttempts = 0;

  constructor(private jwtService: JwtService) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async validateUser(token: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    const user = {
      email: payload.email,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
      username: payload.email,
      userId: userid,
    };

    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        given_name: user.given_name,
        family_name: user.family_name,
        picture: user.picture,
      },
    };
  }

  async loginWithGoogle(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const googleUserId = payload['sub'];

      // Mendapatkan atau membuat pengguna dari database
      const db = admin.firestore();
      let userDoc = await db.collection('users').doc(payload['email']).get();

      let setPassword = false;
      if (!userDoc.exists) {
        // Jika pengguna tidak ada, buat pengguna baru
        const newUser = {
          uid: googleUserId,
          email: payload['email'],
          name: payload['name'],
          // tambahkan field lainnya sesuai kebutuhan
        };
        await db
          .collection('users')
          .doc(payload['email'])
          .set(newUser, { merge: true });
      } else {
        // Jika pengguna sudah ada, periksa apakah mereka sudah memiliki password
        const userRecord = userDoc.data();
        setPassword = !!userRecord.password;
      }

      userDoc = await db.collection('users').doc(payload['email']).get();
      const userRecord = userDoc.data();

      // Menghasilkan token autentikasi untuk sistem Anda
      const tokenPayload = { username: userRecord.email, sub: userRecord.uid };
      const token = this.jwtService.sign(tokenPayload);

      return {
        status: HttpStatus.OK,
        message: 'logged in successfully',
        user: {
          name: userRecord.name,
          email: userRecord.email,
          // tambahkan field lainnya sesuai kebutuhan
          token: token,
        },
        setPassword: setPassword,
        error: false,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Invalid Google token',
          error: true,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async loginWithEmail(email: string, password: string) {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(email).get();

    if (!userDoc.exists) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'User does not exist',
          error: true,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userRecord = userDoc.data();
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userRecord.password,
    );

    if (!isPasswordCorrect) {
      this.failedLoginAttempts++;
      if (this.failedLoginAttempts >= 5) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message:
              'You have reached the maximum number of login attempts. Please try again later.',
            error: true,
          },
          HttpStatus.FORBIDDEN,
        );
      }
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Invalid email or password',
          error: true,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Jika login berhasil, reset hitungan percobaan login yang gagal
    this.failedLoginAttempts = 0;

    const payload = { username: userRecord.email, sub: userRecord.uid };
    return {
      status: HttpStatus.OK,
      message: 'logged in successfully',
      user: {
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
        token: this.jwtService.sign(payload),
      },
      error: false,
    };
  }
}
