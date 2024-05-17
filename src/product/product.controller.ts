// product.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from '../type/product.type';
import { JwtAuthGuard } from '../guard/jwt.authGuard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() imageFile: Express.Multer.File,
    @Req() req,
  ) {
    createProductDto.sellerId = req.user.username;
    return this.productService.create(createProductDto, imageFile);
  }
}
