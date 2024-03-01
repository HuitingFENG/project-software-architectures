import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './models/payment.model';


@Controller('payments')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getAllPayments(): Promise<Payment[]> {
    return this.appService.getAllPayments();
  }

  @Post()
  async createPayment(@Body() paymentData: CreatePaymentDto) {
    return this.appService.createPayment(paymentData);
  }
}