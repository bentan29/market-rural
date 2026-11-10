import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { AuthGuard } from '@nestjs/passport';
import { SellerGuard } from 'src/core/guards/seller.guard';
import { CurrentSeller } from 'src/core/decorators';

@Controller('subscription')
@UseGuards(AuthGuard(), SellerGuard)
export class SubscriptionController {

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('mySuscription')
  mySuscription(@CurrentSeller() sellerId: string){
    return this.subscriptionService.mySuscription(sellerId)
  }

  @Post('cancel')
    @HttpCode(200)
    cancel(@CurrentSeller() sellerId: string) {
      return this.subscriptionService.cancelSuscription(sellerId)
  }

  
}
