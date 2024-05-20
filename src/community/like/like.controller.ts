import { Controller, Post, UseGuards, Request, Param } from '@nestjs/common';
import { LikeService } from './like.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('community/like')
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Post(':postId')
  @UseGuards(AuthGuard('jwt'))
  async createLike(@Request() req, @Param('postId') postId: string) {
    const email = req.user.username;
    return await this.likeService.createLike(email, postId);
  }
}
