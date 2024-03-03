import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Payment } from './models/payment.model';
import { StripeService } from './stripe.service';



@Module({
  imports: [
    ConfigModule.forRoot(), 
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadModels: true, 
      synchronize: true, 
    }),
    SequelizeModule.forFeature([Payment]),
  ],
  controllers: [AppController],
  providers: [AppService, StripeService],
})
export class AppModule {}
