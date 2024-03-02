import { Module } from '@nestjs/common';
import { TokenSessionService } from './token-session.service';

@Module({
  providers: [TokenSessionService]
})
export class TokenSessionModule {}
