import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { Face_classificationController } from './face_classification.controller';
import { Face_classificationService } from './face_classification.service';

@Module({
  imports: [HttpModule],
  controllers: [Face_classificationController],
  providers: [Face_classificationService],
})
export class Face_classificationModule {}
