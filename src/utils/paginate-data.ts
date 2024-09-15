import { PaginationResponseDto } from 'src/common/dto';

export const paginateData = <T>(
  data: T[],
  page: number,
  size: number,
  total: number,
): PaginationResponseDto<T> => {
  return {
    data,
    page,
    size,
    totalCount: total,
    pageCount: Math.ceil(total / size),
  };
};
