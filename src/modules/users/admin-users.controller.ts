import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationResponse, PaginationResponseDto } from 'src/common/dto';
import { CurrentUserId } from 'src/decorators';
import {
  CreateUserDto,
  QueryUserDto,
  UpdateUserDto,
  UserItemDto,
  UserResponseDto,
} from './dto';
import { UsersService } from './users.service';

@ApiTags('admin/users')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({
    type: UserResponseDto,
  })
  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(createUserDto);
  }

  @ApiOkResponse({
    type: PaginationResponse(UserResponseDto),
  })
  @Get()
  findManyWithPagination(
    @Query() query: QueryUserDto,
  ): Promise<PaginationResponseDto<UserItemDto>> {
    return this.usersService.findManyUsersWithPagination(query);
  }

  @ApiOkResponse({
    type: UserResponseDto,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findUserByIdWithCache(id);
  }

  @ApiOkResponse({
    type: UserResponseDto,
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    console.log('🚀 ~ AdminUsersController ~ updateUserDto:', updateUserDto);
    return this.usersService.adminUpdateUserById(id, updateUserDto);
  }

  @Patch(':id/status')
  toggleUserStatus(
    @Param('id') employeeId: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.usersService.toggleUserStatus(employeeId, userId);
  }
}
