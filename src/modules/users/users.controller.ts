import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationResponseDto } from 'src/common/dto';
import { paginateData } from 'src/utils/paginate-data';
import {
  CreateUserDto,
  QueryUserDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(
    @Query() query: QueryUserDto,
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const [result, total] = await this.usersService.findManyWithPagination({
      filterOptions: query?.filters,
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
      },
    });
    return paginateData(result, { page, limit }, total);
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateById(id, updateUserDto);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return this.usersService.deleteById(id);
  }
}
