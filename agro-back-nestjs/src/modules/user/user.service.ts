import { RegisterUserDto } from './dto/register-user.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.module';
import * as bcrypt from 'bcrypt'
import { Prisma } from '@prisma/client';

const SALT_ROUNDS = 10; //- rondas de bcrypt

@Injectable()
export class UserService {

    constructor(
        private readonly prismaClient: PrismaService
    ) {}


    //? --- Registramos usuario
    async registerUser(registerUserDto: RegisterUserDto) {

        //- hasheamos la contraseña
        const hashedPassword = await bcrypt.hash(registerUserDto.password, SALT_ROUNDS);

        try {
            //- Creamos el usuario
            return await this.prismaClient.user.create({
                data: {
                    fullName: registerUserDto.fullName,
                    email: registerUserDto.email,
                    password: hashedPassword,
                },
                omit: { password: true },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('El email ya esta registrado');
            }
            throw error;
        }
    }


    async findUserByEmail(email: string) {
        return this.prismaClient.user.findUnique({ where: { email } });
    }




}
