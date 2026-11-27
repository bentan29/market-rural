import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/core/decorators';
import * as client from '@prisma/client';
import { PaginationDto } from 'src/common/dto';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';

@Controller('favorites')
@UseGuards(AuthGuard())
export class FavoritesController {

  constructor(private readonly favoritesService: FavoritesService) { }

  //- Tomamos todas nuestras favoritas
  @Get('myFavorites')
  getmyFavorites(
    @Query() pagination: PaginationDto,
    @GetUser() user: client.User
  ) {
    return this.favoritesService.getAllOurFavorites(pagination, user.id)
  }

  @Get('ids')
  ids(@GetUser('id') userId: string) {
    return this.favoritesService.ids(userId)
  }

  //- Agrega o quita un favorito
  @Post('toggle')
  @HttpCode(200)
  toggleFavorite(
    @GetUser('id') userId: string,
    @Body() dto: ToggleFavoriteDto,
  ) {
    return this.favoritesService.toggleFavorite(userId, dto.listingId)
  }



}
