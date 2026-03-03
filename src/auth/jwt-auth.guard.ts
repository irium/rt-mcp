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
    const allowAnonymous = this.configService.get<string>(
      'ALLOW_ANONYMOUS',
      'false',
    );

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Allow access if anonymous mode is enabled or route is public
    if (allowAnonymous === 'true' || isPublic) {
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
    const allowAnonymous = this.configService.get<string>(
      'ALLOW_ANONYMOUS',
      'false',
    );

    // In anonymous mode, return a default user if no valid token
    if (allowAnonymous === 'true') {
      if (err || !user) {
        return {
          username: 'anonymous',
          passwordHash: '',
          role: 'admin',
        } as TUser;
      }
      return user;
    }

    // For non-anonymous mode, require valid authentication
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
