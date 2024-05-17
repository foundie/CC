import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';

@Module({
  controllers: [RegisterController],
  providers: [RegisterService],
})
export class RegisterModule {}
