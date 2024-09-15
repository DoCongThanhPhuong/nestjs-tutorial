import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from 'src/decorators';
import { UpdateUserDto, UserResponseDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOkResponse({
    type: UserResponseDto,
  })
  @Get('profile')
  getProfile(@Request() req): Promise<UserResponseDto> {
    return req.user;
  }

  @ApiOkResponse({
    type: UserResponseDto,
  })
  @Patch('profile')
  @UseInterceptors(FileInterceptor('avatar'))
  updateProfile(
    @CurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfileById(userId, updateUserDto, file);
  }
}
