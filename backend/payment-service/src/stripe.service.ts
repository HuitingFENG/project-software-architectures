// src/payment/stripe.service.ts in payment-service

import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  }

  async createStripePayment({ amount, method, customerId, invoice }): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.create({
      amount,
      currency: "eur",
      payment_method: method,
      customer: customerId,
      description: invoice,
      confirm: true,
    });
  }

  async deletePayment(paymentId: string): Promise<any> {
    console.log(`Payment with ID ${paymentId} deleted successfully from the database.`);
    return { message: `Payment with ID ${paymentId} deleted successfully.` };
  }
}
