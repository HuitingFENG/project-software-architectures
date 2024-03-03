import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './models/payment.model';
import { StripeService } from './stripe.service';


@Controller('payments')
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  constructor(
    private readonly appService: AppService,
    private readonly stripeService: StripeService
  ) {}

  @Get()
  async getAllPayments(): Promise<Payment[]> {
    return this.appService.getAllPayments();
  }

  @Post('')
  async createStripePayment(@Body() paymentData: any): Promise<any> {
    const { amount, currency, payment_method, customerId, description, customerEmail } = paymentData;


    return this.stripeService.payAllOrders({ amount, currency, payment_method, customerId, description, customerEmail });
  }

}