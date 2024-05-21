import {
  Controller,
  Post,
  Delete,
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

  @Delete(':commentId')
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(@Request() req, @Param('commentId') commentId: string) {
    const email = req.user.username;
    return await this.commentService.deleteComment(email, commentId);
  }
}
