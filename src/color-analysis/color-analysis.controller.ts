// color-analysis.controller.ts
import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ColorAnalysisService } from './color-analysis.service';
import { ColorAnalysisDto } from './dto/color-analysis.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('predict')
export class ColorAnalysisController {
  constructor(private readonly colorAnalysisService: ColorAnalysisService) {}

  @Post('color')
  @UseGuards(AuthGuard('jwt'))
  async analyzeColor(
    @Request() req,
    @Body() colorAnalysisDto: ColorAnalysisDto,
  ) {
    const loggedInUserEmail = req.user.username;
    return this.colorAnalysisService.analyzeColor(
      loggedInUserEmail,
      colorAnalysisDto,
    );
  }
}
