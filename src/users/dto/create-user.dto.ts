import { UserRole } from '../user.entity';

export class CreateUserDto {
  readonly email: string;
  readonly password: string;
  readonly language?: string;
  readonly role?: UserRole;
}
