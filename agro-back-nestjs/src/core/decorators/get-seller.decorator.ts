import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentSeller = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): string =>
        ctx.switchToHttp().getRequest<{ sellerId: string }>().sellerId,
)