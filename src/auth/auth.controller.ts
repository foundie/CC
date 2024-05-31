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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req) {
    return this.authService.login(req.user);
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
