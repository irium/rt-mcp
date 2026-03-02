import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Ip,
  HttpException,
} from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from './jwt-auth.guard';
import { LoginDto, LoginResponse } from './interfaces/user.interface';

// In-memory rate limiting store
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
}

const loginRateLimit = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_CLEANUP_MS = 10 * 60 * 1000; // 10 minutes

function cleanupExpiredRateLimitEntries(): void {
  const now = Date.now();
  for (const [key, entry] of loginRateLimit.entries()) {
    if (now - entry.firstAttempt > RATE_LIMIT_CLEANUP_MS) {
      loginRateLimit.delete(key);
    }
  }
}

function checkRateLimit(identifier: string): void {
  const now = Date.now();
  const entry = loginRateLimit.get(identifier);

  if (entry) {
    // Reset if window has expired
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
      loginRateLimit.set(identifier, { attempts: 1, firstAttempt: now });
      return;
    }

    // Check if limit exceeded
    if (entry.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
      const retryAfter = Math.ceil(
        (entry.firstAttempt + RATE_LIMIT_WINDOW_MS - now) / 1000,
      );
      throw new HttpException(
        {
          message: 'Too many login attempts. Please try again later.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment attempts
    entry.attempts++;
  } else {
    loginRateLimit.set(identifier, { attempts: 1, firstAttempt: now });
  }

    cleanupExpiredRateLimitEntries();
}

/**
 * Validate login input parameters
 * @throws HttpException if validation fails
 */
function validateLoginInput(loginDto: LoginDto): void {
  if (!loginDto.username || typeof loginDto.username !== 'string' || loginDto.username.trim().length === 0) {
    throw new HttpException(
      { message: 'Username is required' },
      HttpStatus.BAD_REQUEST,
    );
  }
  if (!loginDto.password || typeof loginDto.password !== 'string' || loginDto.password.length === 0) {
    throw new HttpException(
      { message: 'Password is required' },
      HttpStatus.BAD_REQUEST,
    );
  }
  if (loginDto.username.length > 255 || loginDto.password.length > 1000) {
    throw new HttpException(
      { message: 'Input too long' },
      HttpStatus.BAD_REQUEST,
    );
  }
}

// Decorator to mark routes as public (no auth required)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
  ): Promise<LoginResponse> {
    validateLoginInput(loginDto);

    // Rate limit by username (primary) and IP (fallback)
    const rateLimitKey = loginDto.username || ip;
    checkRateLimit(rateLimitKey);

    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: { user: { username: string; role: string } }) {
    return {
      username: req.user.username,
      role: req.user.role,
    };
  }

  @Public()
  @Get('config')
  getAuthConfig(): { allowAnonymous: boolean } {
    const allowAnonymous =
      this.configService.get<string>('ALLOW_ANONYMOUS', 'false') === 'true';
    return { allowAnonymous };
  }
}
