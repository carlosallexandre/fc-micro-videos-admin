import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

type Payload = {
  realm_access?: {
    roles?: string[];
  };
};

@Injectable()
export class CheckIsAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'http') return true;

    const request: Request = context.switchToHttp().getRequest();
    if (!('user' in request)) throw new UnauthorizedException();

    const payload = <Payload>request['user'];
    const roles = payload?.realm_access?.roles ?? [];
    if (roles.indexOf('admin-catalog') === -1) throw new ForbiddenException();

    return true;
  }
}
