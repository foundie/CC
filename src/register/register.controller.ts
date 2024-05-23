// register.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

import { RegisterService } from './register.service';

@Controller()
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body('nama') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.registerService.register(name, email, password);
  }
}
