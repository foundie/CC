import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Param,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('community/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post(':postId')
  @UseGuards(AuthGuard('jwt'))
  async createComment(
    @Request() req,
    @Param('postId') postId: string,
    @Body('text') text: string,
  ) {
    const email = req.user.username;
    return await this.commentService.createComment(email, postId, text);
  }
}
