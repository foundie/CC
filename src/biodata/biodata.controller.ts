// biodata.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BiodataService } from './biodata.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('biodata')
export class BiodataController {
  constructor(private biodataService: BiodataService) {}

  @Post('add')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @Request() req,
    @Body('name') name?: string,
    @Body('phone') phone?: string,
    @Body('location') location?: string,
    @Body('gender') gender?: string,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    const email = req.user.username;
    return await this.biodataService.addBiodata(
      email,
      name,
      phone,
      location,
      gender,
      profileImage,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMyData(@Request() req) {
    const email = req.user.username;
    return await this.biodataService.getMyData(email);
  }

  @Post('add-password')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async addPassword(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.biodataService.addPassword(email, password);
  }
}
