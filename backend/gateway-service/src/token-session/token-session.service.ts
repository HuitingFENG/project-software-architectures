import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenSession } from './token-session.entity/token-session.entity';


@Injectable()
export class TokenSessionService {
    constructor(
        @InjectRepository(TokenSession)
        private tokenSessionRepository: Repository<TokenSession>,
      ) {}
    
      async findTokenSession(tokenId: string): Promise<TokenSession | undefined> {
        return this.tokenSessionRepository.findOne({ where: { tokenId } });
      }
    
      async extendTokenSession(sessionId: string): Promise<void> {
        const session = await this.tokenSessionRepository.findOne({ where: { id: sessionId } });
        if (session) {
          session.expiresAt = new Date(Date.now() + parseInt(process.env.SESSION_EXTENSION_TIME));
          await this.tokenSessionRepository.save(session);
        }
    }

}
