import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { User } from '@prisma/client'
import { PaginationDto } from 'src/common/dto'
import { CurrentSeller, GetUser } from 'src/core/decorators'
import { SellerGuard } from 'src/core/guards/seller.guard'
import { VerifiedEmailGuard } from 'src/core/guards/verified-email.guard'
import { CreateInquiryDto } from './dto/create-inquiry.dto'
import { InquiryService } from './inquiry.service'

@Controller('inquiry')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) { }

  //- Enviar una consulta: exige sesión y email verificado
  @Post(':slug/listing')
  @HttpCode(201)
  @UseGuards(AuthGuard(), VerifiedEmailGuard)
  create(
    @Param('slug') slug: string,
    @GetUser() user: User,
    @Body() dto: CreateInquiryDto,
  ) {
    return this.inquiryService.create(slug, user, dto)
  }

  //- Mis consultas enviadas
  @Get('sent')
  @UseGuards(AuthGuard())
  sent(@GetUser('id') userId: string, @Query() pagination: PaginationDto) {
    return this.inquiryService.getSent(userId, pagination)
  }

  //- Consultas recibidas (vendedor)
  @Get('received')
  @UseGuards(AuthGuard(), SellerGuard)
  received(@CurrentSeller() sellerId: string, @Query() pagination: PaginationDto) {
    return this.inquiryService.getReceived(sellerId, pagination)
  }

  //- Marcar como leída
  @Patch(':id/read')
  @HttpCode(200)
  @UseGuards(AuthGuard(), SellerGuard)
  markRead(@CurrentSeller() sellerId: string, @Param('id') id: string) {
    return this.inquiryService.markRead(sellerId, id)
  }
}