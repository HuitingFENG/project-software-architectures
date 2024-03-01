// src/models/payment.model.ts

import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class Payment extends Model<Payment> {
  @Column
  amount: number;

  @Column
  method: string;

  // ... other fields
}