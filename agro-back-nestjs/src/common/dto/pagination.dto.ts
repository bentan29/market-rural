import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type(() => Number)//- Transformamos a number, en este caso no definimos en el main que haga el transform de los dto's
    page?:number = 1;

    @IsOptional()
    @Min(0)
    @Type(() => Number)
    limit?:number = 8;

}