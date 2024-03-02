import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { ConfigModule } from '@nestjs/config';
import { TokenSessionModule } from './token-session/token-session.module';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthenticateTokenMiddleware } from './auth/authenticateToken.middleware';

@Module({
  imports: [
    GatewayModule, 
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TokenSessionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateTokenMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
