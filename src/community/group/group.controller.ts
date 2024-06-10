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
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  HttpException,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { AuthGuard } from '@nestjs/passport';
import {
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';

@Controller('community')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  async createGroup(
    @Request() req,
    @Body('title') title: string,
    @Body('topics') topics: string,
    @Body('description') description?: string,
    @UploadedFiles()
    files?: {
      profileImage?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
  ) {
    const creator = req.user.username;
    const profileImageFile = files?.profileImage
      ? files.profileImage[0]
      : undefined;
    const coverImageFile = files?.coverImage ? files.coverImage[0] : undefined;

    return await this.groupService.createGroup(
      creator,
      title,
      topics,
      description,
      profileImageFile,
      coverImageFile,
    );
  }

  @Patch('update/:groupId')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  async updateGroup(
    @Param('groupId') groupId: string,
    @Request() req,
    @Body('title') title?: string,
    @Body('topics') topics?: string,
    @Body('description') description?: string,
    @UploadedFiles()
    files?: {
      profileImage?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
  ) {
    const email = req.user.username;
    const profileImageFile = files?.profileImage
      ? files.profileImage[0]
      : undefined;
    const coverImageFile = files?.coverImage ? files.coverImage[0] : undefined;

    return await this.groupService.updateGroup(
      groupId,
      email,
      title,
      topics,
      description,
      profileImageFile,
      coverImageFile,
    );
  }

  @Get('group/search')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.FOUND)
  async getFilteredGroups(
    @Query('q') q?: string,
    @Query('l') l?: number,
    @Query('skip') skip?: number,
    @Query('sort') sort?: string,
  ) {
    try {
      const groups = await this.groupService.getFilteredGroups(
        q,
        l,
        skip,
        sort,
      );
      return {
        status: HttpStatus.OK,
        message: 'Groups successfully retrieved',
        data: groups,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Delete('group/:groupId')
  @UseGuards(AuthGuard('jwt'))
  async deleteGroup(@Request() req, @Param('groupId') groupId: string) {
    return await this.groupService.deleteGroup(req.user.username, groupId);
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
