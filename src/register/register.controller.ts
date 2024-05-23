// register.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterService } from './register.service';

@Controller()
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body('nama') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.registerService.register(name, email, password);
  }

  @Post('update-profile-image')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async uploadProfileImage(
    @Request() req,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    const email = req.user.username;
    return await this.registerService.uploadProfileImage(email, profileImage);
  }
}
