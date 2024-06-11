import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SkinToneController } from './skin_tone.controller';
import { SkinToneService } from './skin_tone.service';

@Module({
  imports: [HttpModule],
  controllers: [SkinToneController],
  providers: [SkinToneService],
})
export class SkinToneModule {}
