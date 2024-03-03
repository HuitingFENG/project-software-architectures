import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';


@Injectable()
export class AppService {
  getHello(): string {
    return 'Payment Service!';
  }

  constructor(
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
  ) {}

  // async createPayment(data: any): Promise<Payment> {
  //   return this.paymentModel.create(data);
  // }

  async getAllPayments(): Promise<Payment[]> {
    return this.paymentModel.findAll();
  }


}
