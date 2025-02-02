export class CreateUserDto {
  readonly email: string;
  readonly password: string;
  readonly language?: string;
  readonly tag: string;
  readonly username: string;
}
