/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req) {
    const user = {
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      picture: req.user.picture,
    };
    const payload = { username: user.email, sub: user.email }; // Menggunakan email sebagai sub
    const token = this.jwtService.sign(payload);
    return {
      status: HttpStatus.OK,
      message: 'logged in successfully',
      user: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: 'user', // Anda perlu mengatur role pengguna
        token: token,
      },
      error: false,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.authService.loginWithEmail(email, password);
  }
}
