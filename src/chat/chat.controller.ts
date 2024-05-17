// chat.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../guard/jwt.authGuard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Request() req,
    @Body('to') to: string,
    @Body('message') message: string,
  ) {
    const from = req.user.username;
    const result = await this.chatService.sendMessage(from, to, message);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getChat(@Param('id') id: string) {
    const chat = await this.chatService.getChat(id);
    return chat;
  }
}
