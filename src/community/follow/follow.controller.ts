import {
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('follow')
export class FollowController {
  constructor(private followService: FollowService) {}

  @Post(':followingEmail')
  @UseGuards(AuthGuard('jwt'))
  async createFollow(
    @Request() req,
    @Param('followingEmail') followingEmail: string,
  ) {
    // Menggunakan email dari pengguna yang saat ini masuk
    const followerEmail = req.user.username;
    return await this.followService.createFollow(followerEmail, followingEmail);
  }

  @Delete(':followingEmail')
  @UseGuards(AuthGuard('jwt'))
  async unfollow(
    @Request() req,
    @Param('followingEmail') followingEmail: string,
  ) {
    // Menggunakan email dari pengguna yang saat ini masuk
    const followerEmail = req.user.username;
    return await this.followService.unfollow(followerEmail, followingEmail);
  }

  @Get('data')
  @UseGuards(AuthGuard('jwt'))
  async getFollowersAndFollowing(@Request() req) {
    // Menggunakan email dari pengguna yang saat ini masuk
    const email = req.user.username;
    return await this.followService.getFollowersAndFollowing(email);
  }
}
