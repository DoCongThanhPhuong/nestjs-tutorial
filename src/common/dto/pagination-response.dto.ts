import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  data: T[];
  page: number;
  limit: number;
  totalCount: number;
  pageCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function PaginationResponse<T>(classReference: Type<T>) {
  abstract class Pagination {
    @ApiProperty({ type: [classReference] })
    data!: T[];

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    pageCount: number;

    @ApiProperty({
      type: Boolean,
      example: true,
    })
    hasNextPage: boolean;

    @ApiProperty({
      type: Boolean,
      example: true,
    })
    hasPreviousPage: boolean;
  }

  Object.defineProperty(Pagination, 'name', {
    writable: false,
    value: `Pagination${classReference.name}ResponseDto`,
  });

  return Pagination;
}
