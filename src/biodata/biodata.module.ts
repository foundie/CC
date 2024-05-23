import { Module } from '@nestjs/common';
import { BiodataService } from './biodata.service';
import { BiodataController } from './biodata.controller';

@Module({
  controllers: [BiodataController],
  providers: [BiodataService],
})
export class BiodataModule {}
