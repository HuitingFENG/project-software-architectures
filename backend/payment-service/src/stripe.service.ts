// src/payment/stripe.service.ts in payment-service

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { stringify } from 'querystring';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  }

  async createStripePayment({ amount, currency, payment_method }): Promise<Stripe.Response<Stripe.PaymentIntent>> {



    return this.stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method: payment_method ,
      confirm: true,
    });
  }

  async payAllOrders( {amount, currency, payment_method, customerId, invoice} ): Promise<any> {
    const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
    const stripeUrl = this.configService.get('STRIPE_URL');
    const headersRequest = {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    const bodyRequest = {
        amount: amount, 
        currency: currency,
        payment_method: payment_method,
        // payment_method_types: ['card'],
        // confirm: true,
        // description: `Payment for session ID ${sessionId} by user ID ${userId} (Email: ${userEmail})`,
        description: invoice
    };
    console.log("bodyRequest: ", bodyRequest);
    try {
        const payViaStripe = await this.httpService.post(stripeUrl, stringify(bodyRequest), { headers: headersRequest }).toPromise();
        console.log("payViaStripe: ", payViaStripe.data);
        console.log("payViaStripe.data.id: ", payViaStripe.data.id);
        return payViaStripe.data;
    } catch (error) {
        console.error('Stripe payment error:', error);
        throw new HttpException('Payment processing failed: ' + error.message, HttpStatus.BAD_REQUEST);
    }
}



//   async deletePayment(paymentId: string): Promise<any> {
//     console.log(`Payment with ID ${paymentId} deleted successfully from the database.`);
//     return { message: `Payment with ID ${paymentId} deleted successfully.` };
//   }
}
