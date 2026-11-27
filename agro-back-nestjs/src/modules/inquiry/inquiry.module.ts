import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { BullModule } from '@nestjs/bullmq';
import { INQUIRY_QUEUE } from './inquiries.constants';
import { MailModule } from '../mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { InquiryNotificationsProcessor } from './inquiry-notification.processor';

@Module({
  imports: [
    //* Passport - Esto dice a NestJS que cuando usemos los guards @UseGuards(AuthGuard()) sin especificar estrategia, 
    //*  use jwt por defecto. Sin esto, AuthGuard() no sabría qué estrategia usar.
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false //- le dice a Passport que no guarde al usuario en una sesión del servidor (cookie + req.session) después de autenticarlo.
    }),
    BullModule.registerQueue({ name: INQUIRY_QUEUE }),
    MailModule,
  ],
  controllers: [InquiryController],
  providers: [InquiryService, InquiryNotificationsProcessor],
})
export class InquiryModule { }
