import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log("payload: ", payload);
    console.log("payload.id: ", payload.id);
    console.log("payload.name: ", payload.name);
    return { id: payload.id, name: payload.name, email: payload.email, role: payload.role, phone: payload.phone, parkId: payload.parkId, parkLocation: payload.parkLocation };
  }
}