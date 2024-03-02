import { Global, Module } from '@nestjs/common';
import { TokenSessionService } from './token-session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenSession } from './token-session.entity/token-session.entity';


// @Global()
@Module({
  // providers: [TokenSessionService]
  imports: [TypeOrmModule.forFeature([TokenSession])],
  providers: [TokenSessionService],
  exports: [TokenSessionService],
})
export class TokenSessionModule {}
