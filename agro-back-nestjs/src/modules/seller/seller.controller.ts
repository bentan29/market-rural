import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SellerService } from './seller.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentSeller, GetUser } from 'src/core/decorators';
import { CreateSellerDto } from './dto/create-seller.dto';
import * as client from '@prisma/client';
import { SellerGuard } from 'src/core/guards/seller.guard';

@Controller('seller')
@UseGuards(AuthGuard())
export class SellerController {

  constructor(
    private readonly sellerService: SellerService,
  ) {}

  //! ================ Privadas ================
    
  //? --- Crear cuenta de vendedor
  @Post('register')
  create(@GetUser() user: client.User, @Body() dto: CreateSellerDto) {
    return this.sellerService.create(user.id, dto)
  }
    
  //? --- Mis datos de vendedor ACTIVO
  //- SellerGuard ya verificó que existe y no está dado de baja, y deja req.sellerId
  @Get('me')
  @UseGuards(SellerGuard)
  getMyProfile(@CurrentSeller() sellerId: string) {
    return this.sellerService.findMine(sellerId)
  }

  //? --- Datos de mi perfil anterior, si soy ex vendedor
  //- Solo AuthGuard (sin SellerGuard): lo consulta alguien que ya no es vendedor activo
  @Get('previous')
  findPrevious(@GetUser() user: client.User) {
    return this.sellerService.findPreviousForReactivation(user.id)
  }


  //* ================ Pubicas ================

  @Get('public/:slug')
  findPublic(@Param('slug') slug: string) {
    return this.sellerService.findPublicBySlug(slug)
  }
}
