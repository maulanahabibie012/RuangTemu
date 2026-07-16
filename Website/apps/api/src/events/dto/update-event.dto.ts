import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { EventCategory, TicketType } from './create-event.dto.js';

export class UpdateEventDto {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  locationName?: string;

  @IsNumber()
  @IsOptional()
  locationLat?: number;

  @IsNumber()
  @IsOptional()
  locationLng?: number;

  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @IsDateString()
  @IsOptional()
  eventEndDate?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;

  @IsEnum(TicketType)
  @IsOptional()
  ticketType?: TicketType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ticketPrice?: number;

  @IsEnum(['DRAFT', 'ACTIVE', 'CANCELLED'] as const)
  @IsOptional()
  status?: 'DRAFT' | 'ACTIVE' | 'CANCELLED';
}