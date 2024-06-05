import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UploadedFiles,
  Param,
  Delete,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';

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
    @UploadedFiles() imageFile: Express.Multer.File,
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

  @Post(':groupId/post')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('image'))
  async createGroupPost(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body('title') title: string,
    @Body('text') text: string,
    @UploadedFiles() imageFiles: Express.Multer.File[],
  ) {
    const email = req.user.username;
    return await this.groupService.createGroupPost(
      email,
      groupId,
      title,
      text,
      imageFiles,
    );
  }

  @Get(':groupId/members')
  @UseGuards(AuthGuard('jwt'))
  async getGroupMembers(@Param('groupId') groupId: string) {
    return await this.groupService.getGroupMembers(groupId);
  }
}
