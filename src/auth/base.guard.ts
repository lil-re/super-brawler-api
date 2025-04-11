import {
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BaseGuard {
  public extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  public extractProfileTagFromHeader(request: Request): string | undefined {
    console.log(request.headers);
    return `${request.headers['profile-tag']}`;
  }
}
