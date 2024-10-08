import { Expose } from 'class-transformer';

export abstract class BaseResponseDto {
  @Expose()
  id: number;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
  @Expose()
  deletedAt: Date;
}
