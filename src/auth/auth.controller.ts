import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ConnectGoogleDto } from './dto/connect-google.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Post('google-login')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    const googleData = await this.authService.verifyGoogleToken(
      googleLoginDto.idToken,
    );

    const user = await this.authService.findOrCreateGoogleUser(
      googleData,
      googleLoginDto.accessToken,
      googleLoginDto.refreshToken,
    );

    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('connect-google')
  async connectGoogle(
    @CurrentUser() user: any,
    @Body() connectGoogleDto: ConnectGoogleDto,
  ) {
    await this.authService.updateGoogleTokens(
      user.id,
      connectGoogleDto.accessToken,
      connectGoogleDto.refreshToken,
    );

    return {
      message: 'Compte Google connecté avec succès',
      hasGoogleAccess: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('disconnect-google')
  async disconnectGoogle(@CurrentUser() user: any) {
    await this.authService.removeGoogleTokens(user.id);

    return {
      message: 'Compte Google déconnecté',
      hasGoogleAccess: false,
    };
  }
}
