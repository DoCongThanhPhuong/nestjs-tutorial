import { PaginationResponseDto } from 'src/common/dto';
import { IPaginationOptions } from 'src/interfaces';

export const paginateData = <T>(
  data: T[],
  options: IPaginationOptions,
  total: number,
): PaginationResponseDto<T> => {
  return {
    data,
    page: options.page,
    limit: options.limit,
    totalCount: total,
    pageCount: Math.ceil(total / options.limit),
    hasNextPage: options.page < Math.ceil(total / options.limit),
    hasPreviousPage: options.page > 1,
  };
};
