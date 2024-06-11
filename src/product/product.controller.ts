import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProductService } from './product.service';
import { AuthGuard } from '@nestjs/passport';
import { FormDataRequest } from 'nestjs-form-data';

@Controller('products')
@FormDataRequest()
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('filter')
  @UseGuards(AuthGuard('jwt'))
  predictProductFilter(
    @Request() req,
    @Body('name') name: string,
    @Body('season') season: string,
  ) {
    return this.productService.predictProductFilter(name, season);
  }
}
