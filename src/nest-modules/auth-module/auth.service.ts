import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(email: string, password: string) {
    const payload = { email, name: 'test' };
    return { access_toekn: this.jwtService.sign(payload) };
  }
}
