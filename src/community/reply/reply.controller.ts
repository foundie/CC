import {
  Controller,
  Post,
  Delete,
  UseGuards,
  Request,
  Body,
  Param,
} from '@nestjs/common';
import { ReplyService } from './reply.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('community/reply')
export class ReplyController {
  constructor(private replyService: ReplyService) {}

  @Post(':commentId')
  @UseGuards(AuthGuard('jwt'))
  async createReply(
    @Request() req,
    @Param('commentId') commentId: string,
    @Body('text') text: string,
  ) {
    const email = req.user.username;
    return await this.replyService.createReply(email, commentId, text);
  }

  @Delete(':replyId')
  @UseGuards(AuthGuard('jwt'))
  async deleteReply(@Request() req, @Param('replyId') replyId: string) {
    const email = req.user.username;
    return await this.replyService.deleteReply(email, replyId);
  }
}
