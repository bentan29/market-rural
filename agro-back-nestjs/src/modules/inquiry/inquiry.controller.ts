import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Controller('listing/:slug/inquiries')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) { }

  //- Pública: la protegen los límites del service y el campo trampa del front
  @Post()
  @HttpCode(201)
  create(@Param('slug') slug: string, @Body() dto: CreateInquiryDto) {
    return this.inquiryService.create(slug, dto)
  }
}
