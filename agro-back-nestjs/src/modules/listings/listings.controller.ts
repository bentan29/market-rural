import { Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { AuthGuard } from '@nestjs/passport';
import { SellerGuard } from 'src/core/guards/seller.guard';
import { CurrentSeller } from 'src/core/decorators';
import { PrivateListingsDto } from './dto/private-listings.dto';
import { ListingsQueryDto } from './dto/listings-query.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ChangeListingStatusDto } from './dto/change-listing-status.dto';

@Controller('listings')
export class ListingsController {

  constructor(private readonly listingsService: ListingsService) { }

  //! ================ RUTAS PRIVADAS ================
  //- Creamos publicacion
  @Post()
  @UseGuards(AuthGuard(), SellerGuard)
  create(@CurrentSeller() sellerId: string, @Body() dto: CreateListingDto) {
    return this.listingsService.create(sellerId, dto)
  }

  //- Firma para subir fotos directo a Cloudinary
  @Post('images/signature')
  @HttpCode(200)
  @UseGuards(AuthGuard(), SellerGuard)
  imageSignature(@CurrentSeller() sellerId: string) {
    return this.listingsService.imageSignature(sellerId)
  }

  //- Tomamos todas nuestras publicaciones
  @Get('myListings')
  @UseGuards(AuthGuard(), SellerGuard)
  myListings(
    @CurrentSeller() sellerId: string, 
    @Query() dto: PrivateListingsDto
  ) {
    return this.listingsService.myListings(sellerId, dto)
  }

  //- Tomamos una sola publicacion con el id
  @Get('myListing/:id')
  @UseGuards(AuthGuard(), SellerGuard)
  myListing(@CurrentSeller() sellerId: string, @Param('id') id: string) {
    return this.listingsService.myListing(sellerId, id)
  }

  //- Marcamos una publicacion como destacada
  @Post(':id/feature')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), SellerGuard)
  feature(@CurrentSeller() sellerId: string, @Param('id') id: string) {
    return this.listingsService.feature(sellerId, id)
  }

  //- Anulamos destacada de una publicacion
  @Delete(':id/feature')
  @UseGuards(AuthGuard('jwt'), SellerGuard)
  unfeature(@CurrentSeller() sellerId: string, @Param('id') id: string) {
    return this.listingsService.unfeature(sellerId, id)
  }

  //- Editar publicacion
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), SellerGuard)
  update(
    @CurrentSeller() sellerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateListingDto
  ) {
    return this.listingsService.update(sellerId, id, dto)
  }

  //- Cambiar el estado de la publicacion
  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), SellerGuard)
  changeStatus(
    @CurrentSeller() sellerId: string,
    @Param('id') id: string,
    @Body() dto: ChangeListingStatusDto,
  ) {
    return this.listingsService.changeStatus(sellerId, id, dto.status)
  }
  


  //* ================ RUTAS PUBLICAS ================
  //- todas las maquinas
  @Get('catalog')
  getCatalog(
    @Query() query: ListingsQueryDto
  ) {
    return this.listingsService.findPublic(query)
  }

  //- Publicaciones destacadas
  @Get('featured')
  getFeatured(
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number
  ) {
    return this.listingsService.findFeatured(limit)
  }

  //- publicacion por slug
  //- Va DESPUÉS de las rutas fijas (myListings, catalog): si no, ":slug" las capturaría
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.listingsService.findPublicBySlug(slug)
  }


}
