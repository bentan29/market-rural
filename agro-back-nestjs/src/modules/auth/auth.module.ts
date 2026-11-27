import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/core/prisma/prisma.service';
import { TokensModule } from '../tokens/tokens.module';
import { SessionModule } from '../session/session.module';
import { JwtStrategy } from './strategies/jwt-strategy';
import { MailModule } from '../mail/mail.module';
import { BullModule } from '@nestjs/bullmq';
import { MAIL_QUEUE } from '../mail/constants/mail.constants';
import { EmailVerificationService } from './email-verification/email-verification.service';
import { EmailVerificationProcessor } from './email-verification/email-verification.processor';
import { VerificationCleanupService } from './email-verification/verification-cleanup.service';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    TokensModule,
    SessionModule,
    MailModule,
    BullModule.registerQueue({ name: MAIL_QUEUE }),

    //* Passport - Esto dice a NestJS que cuando usemos los guards @UseGuards(AuthGuard()) sin especificar estrategia, 
    //*  use jwt por defecto. Sin esto, AuthGuard() no sabría qué estrategia usar.
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false //- le dice a Passport que no guarde al usuario en una sesión del servidor (cookie + req.session) después de autenticarlo.
    }),

  ],

  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    EmailVerificationService,
    EmailVerificationProcessor,
    VerificationCleanupService,
  ],
  exports: [PassportModule, JwtStrategy]
})
export class AuthModule { }
