import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkinToneService } from './skin_tone.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('predict')
export class SkinToneController {
  constructor(private skintoneservice: SkinToneService) {}

  @Post('skin')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  async predict(@Request() req, @UploadedFile() image: Express.Multer.File) {
    const loggedInUserEmail = req.user.username;
    return this.skintoneservice.predictSkinTone(
      loggedInUserEmail,
      image.buffer,
    );
  }

  @Get('skin/histori')
  @UseGuards(AuthGuard('jwt'))
  async getHistory(@Request() req) {
    const loggedInUserEmail = req.user.username;
    return this.skintoneservice.getUserHistory(loggedInUserEmail);
  }
}
