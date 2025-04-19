import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  readonly email?: string;
  readonly password?: string;
}
