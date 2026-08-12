import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom, isObservable } from 'rxjs';
import { DeviceApiKeyGuard } from './device-api-key.guard';

/**
 * Accepts either a valid Bearer JWT or a device API key (X-Device-Api-Key).
 */
@Injectable()
export class JwtOrDeviceApiKeyGuard implements CanActivate {
  constructor(private readonly deviceGuard: DeviceApiKeyGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers?.authorization as string | undefined;

    if (auth?.startsWith('Bearer ')) {
      const jwtGuard = new (AuthGuard('jwt'))();
      try {
        const result = jwtGuard.canActivate(context);
        const ok = isObservable(result)
          ? await firstValueFrom(result)
          : await Promise.resolve(result);
        if (ok) return true;
      } catch {
        // fall through to device key
      }
    }

    try {
      return await this.deviceGuard.canActivate(context);
    } catch {
      throw new UnauthorizedException('JWT or device API key required');
    }
  }
}
