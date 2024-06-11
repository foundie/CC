// product.module.ts

import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { HttpModule } from '@nestjs/axios';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [HttpModule, NestjsFormDataModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
