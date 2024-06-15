import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { AuthGuard } from '@nestjs/passport';
import { FormDataRequest } from 'nestjs-form-data';

@Controller('products')
@FormDataRequest()
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  getProducts(@Query('limit') limit: number, @Query('skip') skip: number) {
    return this.productService.getProducts(limit, skip);
  }

  @Post('filter')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  predictProductFilter(
    @Request() req,
    @Body('name') name: string,
    @Body('season') season: string,
  ) {
    return this.productService.predictProductFilter(name, season);
  }
}
