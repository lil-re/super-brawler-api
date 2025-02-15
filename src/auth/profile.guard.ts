import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { ProfilesService } from '../profiles/profiles.service';
import { BaseGuard } from './base.guard';

@Injectable()
export class ProfileGuard extends BaseGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly profilesService: ProfilesService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const profileId = this.extractProfileIdFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const profile = await this.profilesService.findOne(profileId);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      if (profile.user.id !== payload.sub) {
        return false;
      }

      request['user'] = payload;
      request['profile'] = profile;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
