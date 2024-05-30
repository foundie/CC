/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
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

  async loginWithEmail(email: string, password: string) {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(email).get();

    if (!userDoc.exists) {
      return {
        status: 'error',
        message: 'User does not exist',
        error: true,
      };
    }

    const userRecord = userDoc.data();
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userRecord.password,
    );

    if (!isPasswordCorrect) {
      this.failedLoginAttempts++;
      if (this.failedLoginAttempts >= 5) {
        return {
          status: 'error',
          message:
            'You have reached the maximum number of login attempts. Please try again later.',
          error: true,
        };
      }
      return {
        status: 'error',
        message: 'Invalid email or password',
        error: true,
      };
    }

    // Jika login berhasil, reset hitungan percobaan login yang gagal
    this.failedLoginAttempts = 0;

    const payload = { username: userRecord.email, sub: userRecord.uid };
    return {
      status: 'ok',
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
