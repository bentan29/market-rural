import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class ToggleFavoriteDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    listingId: string
}