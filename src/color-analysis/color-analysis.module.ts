// color-analysis.module.ts
import { Module } from '@nestjs/common';
import { ColorAnalysisService } from './color-analysis.service';
import { ColorAnalysisController } from './color-analysis.controller';

@Module({
  controllers: [ColorAnalysisController],
  providers: [ColorAnalysisService],
})
export class ColorAnalysisModule {}
