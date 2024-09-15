import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { AuthService } from './auth.service';
import {
  AuthConfirmEmailDto,
  AuthEmailLoginDto,
  AuthForgotPasswordDto,
  AuthRegisterLoginDto,
  AuthResetPasswordDto,
  LoginResponseDto,
} from './dto';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.authService.validateLogin(loginDto);
  }

  @Post('register')
  @Public()
  async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<void> {
    return this.authService.register(createUserDto);
  }

  @Patch('confirm-email')
  @Public()
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.authService.confirmEmail(confirmEmailDto.hash);
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Patch('reset-password')
  @Public()
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
