import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request, // Tambahkan import ini
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Face_classificationService } from './face_classification.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('predict')
export class Face_classificationController {
  constructor(private face_classificationService: Face_classificationService) {}

  @Post('face')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  async predict(@Request() req, @UploadedFile() image: Express.Multer.File) {
    const loggedInUserEmail = req.user.username;
    return this.face_classificationService.predictFace(
      loggedInUserEmail,
      image.buffer,
    );
  }
}
