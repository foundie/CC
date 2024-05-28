// post.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UploadedFiles,
  Get,
  Param,
  Query,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('community')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('post')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('image'))
  async createPost(
    @Request() req,
    @Body('title') title: string,
    @Body('text') text: string,
    @UploadedFiles() imageFiles: Express.Multer.File[],
  ) {
    const email = req.user.username;
    return await this.postService.createPost(email, title, text, imageFiles);
  }

  @Get(':postId')
  @UseGuards(AuthGuard('jwt'))
  async getPostData(@Param('postId') postId: string) {
    return await this.postService.getPostData(postId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getFilteredPosts(
    @Query('q') q: string,
    @Query('l') l: string,
    @Query('skip') skip: string,
    @Query('sort') sort: string,
  ) {
    return await this.postService.getFilteredPosts(
      q,
      parseInt(l),
      parseInt(skip),
      sort,
    );
  }

  @Delete(':postId')
  @UseGuards(AuthGuard('jwt'))
  async deletePost(@Request() req, @Param('postId') postId: string) {
    return await this.postService.deletePost(req.user.username, postId);
  }
}
