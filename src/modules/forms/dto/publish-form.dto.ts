import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';
import { IsAfterNow } from 'src/decorators';

export class PublishFormDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @IsAfterNow({ message: 'Closed time must be after now' })
  closedAt: Date;
}
