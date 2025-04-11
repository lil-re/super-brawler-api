import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfilesService } from '../profiles/profiles.service';
import { BaseGuard } from './base.guard';

@Injectable()
export class ProfileGuard extends BaseGuard implements CanActivate {
  constructor(
    private readonly profilesService: ProfilesService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const profileTag = this.extractProfileTagFromHeader(request);
    console.log(profileTag);

    try {
      const profile = await this.profilesService.findOneByTag(profileTag);
      request['profile'] = profile;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
