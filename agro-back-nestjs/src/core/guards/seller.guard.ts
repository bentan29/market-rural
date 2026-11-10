import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.module";

@Injectable()
export class SellerGuard implements CanActivate {

    constructor(private readonly prismaClient: PrismaService) {}

    async canActivate(context: ExecutionContext):  Promise<boolean>  {

        //- El usuario lo deja JwtStrategy (por eso AuthGuard va ANTES que este guard en @UseGuards)
        const req = context
        .switchToHttp()
        .getRequest<{ user?: { id: string }; sellerId?: string }>()

        const userId = req.user?.id;
        if(!userId) throw new ForbiddenException('No autenticado');

        //- Tomamos los datos de seller de la base de datos
        const seller = await this.prismaClient.seller.findUnique({
            where: { userId, deletedAt: null},
            select: { id: true }, //- Solamente tomamos el id de seller
        })

        if (!seller) throw new ForbiddenException('No sos un vendedor');

        //- Dejamos el STRING del id (no el objeto) para @CurrentSeller()
        req.sellerId = seller.id

        return true
    }


}