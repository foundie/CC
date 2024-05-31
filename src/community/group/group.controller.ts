import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UploadedFile,
  UseInterceptors,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('community')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image'))
  async createGroup(
    @Request() req,
    @Body('title') title: string,
    @Body('topics') topics: string,
    @Body('description') description: string,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    // Menggunakan email dari pengguna yang saat ini masuk
    const creator = req.user.username;
    return await this.groupService.createGroup(
      creator,
      title,
      topics,
      description,
      imageFile,
    );
  }

  @Post(':groupId/subscribe')
  @UseGuards(AuthGuard('jwt'))
  async joinGroup(@Request() req, @Param('groupId') groupId: string) {
    // Menggunakan email dari pengguna yang saat ini masuk
    const email = req.user.username;
    return await this.groupService.joinGroup(email, groupId);
  }

  @Delete(':groupId/unsubscribe')
  @UseGuards(AuthGuard('jwt'))
  async leaveGroup(@Request() req, @Param('groupId') groupId: string) {
    // Menggunakan email dari pengguna yang saat ini masuk
    const email = req.user.username;
    return await this.groupService.leaveGroup(email, groupId);
  }
}
