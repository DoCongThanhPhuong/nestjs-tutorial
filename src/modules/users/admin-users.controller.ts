import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiOperation,
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

@ApiTags('Admin/Users')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create new user' })
  @ApiCreatedResponse({
    type: UserResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({
    type: PaginationResponse(UserItemDto),
  })
  @Get()
  listAll(
    @Query() query: QueryUserDto,
  ): Promise<PaginationResponseDto<UserItemDto>> {
    return this.usersService.listAllUsers(query);
  }

  @ApiOperation({ summary: 'View user profile' })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findUserByIdWithCache(id);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.adminUpdateUserById(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Change user status' })
  @Patch(':id/status')
  toggleUserStatus(
    @Param('id') employeeId: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.usersService.toggleUserStatus(employeeId, userId);
  }
}
