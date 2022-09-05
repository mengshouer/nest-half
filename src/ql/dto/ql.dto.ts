import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QLDto {
  @IsNotEmpty()
  @IsString()
  readonly cookie: string;

  @IsOptional()
  @IsString()
  readonly remarks?: string;
}
