import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(

    (data: string, ctx: ExecutionContext) => {

        //- Tomamos toda la request, incluso lo que metrimos en los guards
        const req = ctx.switchToHttp().getRequest();
        
        //- La req.user la pasamos en el validador de token desde el JwtStrategy
        const user = req.user;

        if(!user)
            throw new InternalServerErrorException('User not found (in request)');

        //- Retornamos el usuario entero o algun valor del usuario
        return (!data)
            ? user
            : user[data];

    }

)