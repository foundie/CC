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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BiodataService } from './biodata.service';

@Controller('biodata')
export class BiodataController {
  constructor(private biodataService: BiodataService) {}

  @Post('add')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
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
}
