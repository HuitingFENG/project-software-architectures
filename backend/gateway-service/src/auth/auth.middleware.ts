// auth.middleware.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('Authentication token is missing', HttpStatus.UNAUTHORIZED);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      request.user = decoded;
      return true;
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
    }
  }
}
