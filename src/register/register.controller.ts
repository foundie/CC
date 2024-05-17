import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterService } from './register.service';

@Controller('register')
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role: string,
  ) {
    await this.registerService.register(email, password, role);
    return {
      status: 'ok',
      message: 'register successfuly',
    };
  }
}
