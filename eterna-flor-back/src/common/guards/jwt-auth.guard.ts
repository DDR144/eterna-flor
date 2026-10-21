import {
  Injectable,
  ExecutionContext,
  UnauthorizedException as NestUnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = { id: number; email: string }>(
    err: unknown,
    user: TUser,
  ): TUser {
    if (err || !user) {
      if (err instanceof Error) {
        throw err;
      }
      throw new NestUnauthorizedException('Acceso no autorizado');
    }
    return user;
  }
}
