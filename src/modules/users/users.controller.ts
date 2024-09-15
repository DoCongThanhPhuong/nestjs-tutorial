import { Body, Controller, Get, Patch, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from 'src/decorators';
import { UpdateProfileDto, UserResponseDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'View profile' })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  @Get('profile')
  getProfile(@Request() req): Promise<UserResponseDto> {
    return req.user;
  }

  @ApiOperation({ summary: 'Update profile' })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  @Patch('profile')
  updateProfile(
    @CurrentUserId() userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfileById(userId, updateProfileDto);
  }
}
