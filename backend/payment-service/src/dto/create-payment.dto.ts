// src/dto/create-payment.dto.ts

export class CreatePaymentDto {
    amount: number;
    method: string;
    customerId: string;
    invoice: string;
}
