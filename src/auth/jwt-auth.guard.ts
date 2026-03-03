import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const singleUserMode = this.configService.get<string>(
      'SINGLE_USER_MODE',
      'false',
    );

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Allow access if single user mode is enabled or route is public
    if (singleUserMode === 'true' || isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser,
    info: Error | undefined,
    context: ExecutionContext,
  ): TUser {
    const singleUserMode = this.configService.get<string>(
      'SINGLE_USER_MODE',
      'false',
    );

    // In single user mode, return a default admin user if no valid token
    if (singleUserMode === 'true') {
      if (err || !user) {
        return {
          username: 'admin',
          passwordHash: '',
          role: 'admin',
        } as TUser;
      }
      return user;
    }

    // For multi-user mode, require valid authentication
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          info?.message || 'Authentication required',
        )
      );
    }

    return user;
  }
}
