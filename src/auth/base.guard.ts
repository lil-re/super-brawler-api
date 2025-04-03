import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { BattlesService } from '../battles/battles.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class BaseGuard {
  public extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  public extractProfileIdFromHeader(request: Request): string | undefined {
    return `${request.headers.profile}`;
  }
}
