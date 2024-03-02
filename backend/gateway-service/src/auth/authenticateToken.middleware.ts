// gateway-service/src/auth/authenticateToken.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { TokenSessionService } from '../token-session/token-session.service'; 

@Injectable()
export class AuthenticateTokenMiddleware implements NestMiddleware {
  constructor(private readonly tokenSessionService: TokenSessionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    console.log('Request path:', req.path);
    console.log('Middleware applied to:', req.path);

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing. - message from ATM' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      // If JWT is expired, check for an active token session
      const tokenSession = await this.tokenSessionService.findTokenSession(token);
      if (tokenSession && tokenSession.expiresAt > new Date()) {
        req.user = tokenSession.userDetails;
        await this.tokenSessionService.extendTokenSession(tokenSession.id);
        next();
      } else {
        res.status(403).json({ message: 'Token has expired and session is not active.' });
      }
    }
  }
}