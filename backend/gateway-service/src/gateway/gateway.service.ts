import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GatewayService {
    constructor(private httpService: HttpService) {}
}