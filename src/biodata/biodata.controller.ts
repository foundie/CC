// biodata.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BiodataService } from './biodata.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('biodata')
export class BiodataController {
  constructor(private biodataService: BiodataService) {}

  @Post('add')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  async uploadProfileImage(
    @Request() req,
    @Body('name') name?: string,
    @Body('phone') phone?: string,
    @Body('location') location?: string,
    @Body('gender') gender?: string,
    @UploadedFiles()
    files?: {
      profileImage?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
  ) {
    const email = req.user.username;
    const profileImage = files?.profileImage
      ? files.profileImage[0]
      : undefined;
    const coverImage = files?.coverImage ? files.coverImage[0] : undefined;

    return await this.biodataService.addBiodata(
      email,
      name,
      phone,
      location,
      gender,
      profileImage,
      coverImage,
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
    @Request() req,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const loggedInUserEmail = req.user.username;
    return await this.biodataService.addPassword(
      loggedInUserEmail,
      email,
      password,
    );
  }

  @Get(':email')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Param('email') email: string) {
    return await this.biodataService.getUserProfile(email);
  }
}
