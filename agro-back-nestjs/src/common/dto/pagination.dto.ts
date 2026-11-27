import { Type } from "class-transformer"
import { IsInt, IsOptional, Max, Min } from "class-validator"

export class PaginationDto {

    //- @Type transforma el texto de la URL a número (no depende de la configuración del ValidationPipe)
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10_000)
    page?: number = 1

    //- Mínimo 1 (con 0 la cuenta de páginas se divide por cero) y un tope, para que nadie pida 100000 filas de una
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 8
}