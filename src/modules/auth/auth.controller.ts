import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from 'src/decorators';
import { AuthService } from './auth.service';
import {
  AuthEmailLoginDto,
  AuthForgotPasswordDto,
  AuthResetPasswordDto,
  ChangePasswordDto,
  LoginResponseDto,
  RefreshResponseDto,
  RefreshTokenDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @Post('login')
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.authService.validateLogin(loginDto);
  }

  @ApiOperation({ summary: 'Forgot password' })
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({ summary: 'Reset password' })
  @Patch('reset-password')
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @ApiOperation({ summary: 'Change password' })
  @Patch('change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.authService.changePassword(changePasswordDto, userId);
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @Post('refresh-token')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
