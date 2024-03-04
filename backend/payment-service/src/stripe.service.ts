// src/payment/stripe.service.ts in payment-service

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { stringify } from 'querystring';
import Stripe from 'stripe';
import { Payment } from './models/payment.model';

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

    async payAllOrders( {amount, currency, payment_method, customerEmail, customerId, description} ): Promise<any> {
        const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
        const stripeCreateCustomerUrl = this.configService.get('STRIPE_CREATE_CUSTOMER_URL');
        const stripeUrl = this.configService.get('STRIPE_URL');
        const headersRequest = {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        const createCustomerRequest = {
            email: customerEmail,
        }
        console.log("description: ", description);
        console.log("amount for Stripe Payment Process: ", amount);
        
        try {
            const createCustomerViaStripe = await this.httpService.post(stripeCreateCustomerUrl, stringify(createCustomerRequest), { headers: headersRequest }).toPromise();
            const customerIdStripe = createCustomerViaStripe.data.id;
            console.log("customerIdStripe: ", customerIdStripe);

            const bodyRequest = {
                amount: amount, 
                currency: currency,
                payment_method: payment_method,
                customer: customerIdStripe,
                description: description
            };
            console.log("bodyRequest: ", bodyRequest);
            try {
                const payViaStripe = await this.httpService.post(stripeUrl, stringify(bodyRequest), { headers: headersRequest }).toPromise();
                console.log("payViaStripe: ", payViaStripe.data);
                console.log("payViaStripe.data.id: ", payViaStripe.data.id);

                try {
                    const paymentRecord = await Payment.create({
                        // id: payViaStripe.data.id,
                        amount: amount / 100,
                        method: payment_method,
                        customerId: customerId, 
                        invoice: description, 
                        stripe: payViaStripe.data, 
                    });

                    console.log("Payment record created: ", paymentRecord.id);
 
                    return [ {"paymentRecord": paymentRecord}, { "payViaStripe.data" : payViaStripe.data } ];

                } catch (error) {
                    console.error('Error saving payment record:', error);
                    throw new HttpException('Failed to save payment record', HttpStatus.INTERNAL_SERVER_ERROR);
                }

                // return payViaStripe.data;
                
                
            } catch (error) {
                console.error('Stripe payment error:', error);
                throw new HttpException('Payment processing failed: ' + error.message, HttpStatus.BAD_REQUEST);
            }

        } catch (error) {
            console.error('Stripe payment error:', error);
            throw new HttpException('Payment processing failed: ' + error.message, HttpStatus.BAD_REQUEST);
        }


    }




}
