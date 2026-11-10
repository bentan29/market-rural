import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../user/dto';
import { LoginUserDto } from './dto/login-user.dto';
import type { Request, Response } from 'express' 
import { ACCESS_COOKIE_NAME, JWT_ACCESS_EXPIRATION_MS, REFRESH_COOKIE_NAME, REFRESH_TOKEN_SEVEN_DAYS_MS,} from 'src/common/constants';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/core/decorators';
import * as client from '@prisma/client';

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  //- En prod: COOKIE_DOMAIN=.midominio.com. En local queda sin definir (host-only)
  //...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
};
const accessCookieOptions = { ...baseCookie, path: '/' };
// const refreshCookieOptions = { ...baseCookie, path: '/auth' }
const refreshCookieOptions = { ...baseCookie, path: '/' }

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  //? ---------------
  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto)
  }


  //? ---------------
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginUserDto,
    @Req() req: Request,  
    @Res({ passthrough: true }) res: Response, //passthrough: true le dice a Nest: "dame acceso a res para hacer cosas de bajo nivel (como res.cookie(...))
  ){
    const {refreshToken, accessToken, ...result} = await this.authService.login(loginDto, {
      userAgent: req.headers['user-agent'], // userAgent: un texto que manda el navegador y dice quién es, por ejemplo Mozilla/5.0 (iPhone; ...) Safari/....
      ipAddress: req.ip, // ipAddress: desde dónde se conecta.
    });

    //* -- Guardamos en las cookies
    //- AccesToken
    res.cookie(ACCESS_COOKIE_NAME, accessToken, {
      ...accessCookieOptions,
      maxAge: JWT_ACCESS_EXPIRATION_MS,
    });
    //- RefreshToken
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, { 
      ...refreshCookieOptions, 
      maxAge: REFRESH_TOKEN_SEVEN_DAYS_MS 
    });

    return result;  // solo { user }
  }


  //? --------------- refrescar tokens
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request, 
    @Res({ passthrough: true }) res: Response
  ) {

    const { accessToken, refreshToken } = await this.authService.refresh(
      req.cookies?.[REFRESH_COOKIE_NAME],
    );

    //- Cada res.cookie(...) agrega un header Set-Cookie a la respuesta HTTP.

    //* -- Guardamos en las cookies
    //- AccesToken
    res.cookie(ACCESS_COOKIE_NAME, accessToken, {
      ...accessCookieOptions,
      maxAge: JWT_ACCESS_EXPIRATION_MS,
    });
    //- RefreshToken
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, { 
      ...refreshCookieOptions, 
      maxAge: REFRESH_TOKEN_SEVEN_DAYS_MS 
    });
  }


  //? --- Logout (público a propósito: funciona aunque el access ya haya vencido)
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies?.[REFRESH_COOKIE_NAME]);
    this.clearAuthCookies(res);
    return { ok: true };
  }

  
  //? --- Logout de todos los dispositivos
  @Post('logout-all')
  @HttpCode(200)
  @UseGuards(AuthGuard()) // - AuthGuard()) → es el gatillo que activa esa lógica del JwtStrategy
  async logoutAll(@GetUser() user: client.User, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(user.id);
    this.clearAuthCookies(res);
    return { ok: true };
  }


  //? --- Sesiones activas
  @Get('sessions')
  @UseGuards(AuthGuard())
  getSessions(@GetUser() user: client.User) {
    return this.authService.getSessions(user.id);
  }


  //? --- Cerrar una sesión puntual
  @Delete('sessions/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard())
  async revokeSession(@GetUser() user: client.User, @Param('id') id: string) {
    await this.authService.revokeSession(user.id, id);
    return { ok: true };
  }

  
  //* --- Datos de usuario logeado
  @Get('me')
  @UseGuards(AuthGuard())
  getMe(@GetUser() user: client.User) {
    //- Solo lo que el front necesita, nunca el objeto completo
    return { 
      id: user.id, 
      fullName: user.fullName, 
      email: user.email, 
      role: user.role 
    }
  }



  private clearAuthCookies(res: Response) {
    res.clearCookie(ACCESS_COOKIE_NAME, accessCookieOptions);
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  }


}
