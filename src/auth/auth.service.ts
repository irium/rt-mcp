import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersConfigService } from '../config/users.config';
import {
  User,
  LoginDto,
  LoginResponse,
  JwtPayload,
} from './interfaces/user.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_SALT_ROUNDS = 10;
  private readonly JWT_EXPIRATION = '7d';

  constructor(
    private readonly usersConfigService: UsersConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = this.usersConfigService.findByUsername(username);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = this.generateJwtPayload(user);
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.JWT_EXPIRATION,
    });

    this.logger.log(`User "${user.username}" logged in successfully`);

    return {
      access_token,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  }

  generateJwtPayload(user: User): JwtPayload {
    return {
      sub: user.username,
      username: user.username,
      role: user.role,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_SALT_ROUNDS);
  }
}
