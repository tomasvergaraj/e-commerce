import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthThrottle, AuthThrottleGuard } from './guards/auth-throttle.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthThrottleGuard)
  @AuthThrottle({ name: 'registro', limit: 4, ttlSeconds: 60 * 60, key: 'ip-email' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(AuthThrottleGuard)
  @AuthThrottle({ name: 'inicio de sesion', limit: 5, ttlSeconds: 10 * 60, key: 'ip-email' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AuthThrottleGuard)
  @AuthThrottle({ name: 'cambio de contrasena', limit: 5, ttlSeconds: 15 * 60, key: 'ip-user' })
  @Post('change-password')
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, dto);
  }
}
