import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async logIn(email: string, pass: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOneByEmail(email);
    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.create(signUpDto);

    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
