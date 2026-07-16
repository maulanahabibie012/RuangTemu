import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';
import { EventCategory } from './create-event.dto';

export class QueryEventsDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumberString()
  lat?: string;

  @IsOptional()
  @IsNumberString()
  lng?: string;

  @IsOptional()
  @IsNumberString()
  radiusKm?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsEnum(['FREE', 'PAID'] as const)
  ticketType?: 'FREE' | 'PAID';

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsEnum(['date_asc', 'date_desc', 'price_asc', 'price_desc', 'popular'] as const)
  sort?: string;
}