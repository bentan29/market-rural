import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/core/decorators';
import * as client from '@prisma/client';
import { PaginationDto } from 'src/common/dto';

@Controller('favorites')
@UseGuards(AuthGuard())
export class FavoritesController {

  constructor(private readonly favoritesService: FavoritesService) {}

  //- Agregamos y Quitamos favorito
  @Post('toggle')
  toggleFavorite(
    @Body('listingId') listingId: string,
    @GetUser() user: client.User,
  ) {
    return this.favoritesService.toggleFavorite(user.id, listingId)
  }

  //- Tomamos todas nuestras favoritas
  @Get()
  getOurFavorites(
    @Query() paginationFavourites: PaginationDto,
    @GetUser() user: client.User
  ){
    return this.favoritesService.getAllOurFavorites(paginationFavourites, user.id)
  }


  @Get('ids')
    ids(@GetUser('id') userId: string) {
        return this.favoritesService.ids(userId)
    }
}
