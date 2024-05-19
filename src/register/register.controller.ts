import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UploadedFile,
} from '@nestjs/common';
import { RegisterService } from './register.service';

@Controller('register')
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async register(
    @Body('nama') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('usia') age: number,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    return await this.registerService.register(
      name,
      email,
      password,
      age,
      profileImage,
    );
  }
}
