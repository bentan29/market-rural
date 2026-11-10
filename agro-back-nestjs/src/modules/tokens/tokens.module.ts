import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/core/config';
import { JWT_ACCESS_EXPIRATION_SECONDS } from 'src/common/constants';

@Module({

  imports: [
    //? --- Jwt configuracion para firmar los tokens
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: envs.jwtSecret,
          signOptions: {
            expiresIn: JWT_ACCESS_EXPIRATION_SECONDS
          }
        }
      }
    })
  ],

  providers: [TokensService],
  exports: [TokensService,], // ← sin esto AuthModule no puede inyectarlo

})
export class TokensModule {}
