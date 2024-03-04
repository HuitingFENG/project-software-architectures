// src/models/payment.model.ts

import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Payment extends Model<Payment> {
  @Column
  amount: number;

  @Column
  method: string;

  @Column
  customerId: string;

  @Column
  invoice: string;

  @Column(DataType.JSON)
  stripe: JSON;
}