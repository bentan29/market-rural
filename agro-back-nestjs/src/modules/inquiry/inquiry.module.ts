import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { BullModule } from '@nestjs/bullmq';
import { INQUIRY_QUEUE } from './inquiries.constants';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: INQUIRY_QUEUE }),
    MailModule,
  ],
  controllers: [InquiryController],
  providers: [InquiryService],
})
export class InquiryModule { }
