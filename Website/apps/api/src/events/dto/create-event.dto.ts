import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';

export enum TicketType {
  FREE = 'FREE',
  PAID = 'PAID',
}

export enum EventCategory {
  TECHNOLOGY = 'TECHNOLOGY',
  MUSIC = 'MUSIC',
  SPORTS = 'SPORTS',
  EDUCATION = 'EDUCATION',
  BUSINESS = 'BUSINESS',
  ART = 'ART',
  FOOD = 'FOOD',
  HEALTH = 'HEALTH',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER',
}

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  locationName!: string;

  @IsNumber()
  @IsOptional()
  locationLat?: number;

  @IsNumber()
  @IsOptional()
  locationLng?: number;

  @IsDateString()
  eventDate!: string;

  @IsDateString()
  @IsOptional()
  eventEndDate?: string;

  @IsNumber()
  @Min(1)
  maxCapacity!: number;

  @IsEnum(TicketType)
  @IsOptional()
  ticketType?: TicketType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ticketPrice?: number;
}