// post.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UploadedFile,
  Get,
  Param,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('community')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('post')
  @UseGuards(AuthGuard('jwt'))
  async createPost(
    @Request() req,
    @Body('title') title: string,
    @Body('text') text: string,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    const email = req.user.username;
    return await this.postService.createPost(email, title, text, imageFile);
  }

  @Get(':postId')
  @UseGuards(AuthGuard('jwt'))
  async getPostData(@Param('postId') postId: string) {
    return await this.postService.getPostData(postId);
  }
}
