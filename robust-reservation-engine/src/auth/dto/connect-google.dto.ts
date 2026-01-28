import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ConnectGoogleDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}
