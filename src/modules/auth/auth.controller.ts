import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthEmailLoginDto,
  AuthForgotPasswordDto,
  AuthResetPasswordDto,
  LoginResponseDto,
  RefreshResponseDto,
  RefreshTokenDto,
} from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @Post('login')
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.authService.validateLogin(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Patch('reset-password')
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

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
