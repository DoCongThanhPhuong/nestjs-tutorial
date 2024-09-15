import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  data: T[];
  page: number;
  size: number;
  totalCount: number;
  pageCount: number;
}

export function PaginationResponse<T>(classReference: Type<T>) {
  abstract class Pagination {
    @ApiProperty({ type: [classReference] })
    data!: T[];

    @ApiProperty()
    page: number;

    @ApiProperty()
    size: number;

    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    pageCount: number;
  }

  Object.defineProperty(Pagination, 'name', {
    writable: false,
    value: `Pagination${classReference.name}`,
  });

  return Pagination;
}
