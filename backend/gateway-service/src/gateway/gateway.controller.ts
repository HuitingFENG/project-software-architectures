import { Controller, All, Req, Res, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller()
export class GatewayController {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  @All('*')
  async handleAllRequests(@Req() req: Request, @Res() res: Response) {
    const serviceUrl = this.determineServiceUrl(req);

    try {
      const serviceResponse = await this.httpService.request({
        method: req.method,
        url: serviceUrl + req.url,
        data: req.body,
        headers: req.headers,
      }).toPromise();

      res.status(serviceResponse.status).json(serviceResponse.data);
    } catch (error) {
      res.status(error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR).json(error.response?.data);
    }
  }

  private determineServiceUrl(req: Request): string {
    const userServiceUrl = this.configService.get('USER_SERVICE_URL');
    const productCatalogServiceUrl = this.configService.get('PRODUCT_CATALOG_SERVICE_URL');
    const orderManagementServiceUrl = this.configService.get('ORDER_MANAGEMENT_SERVICE_URL');
    const paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL');
    const notificationServiceUrl = this.configService.get('NOTIFICATION_SERVICE_URL');
    const sessionManagementServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');

    if (req.path.startsWith('/users')) {
      return userServiceUrl;
    } else if (req.path.startsWith('/products')) {
      return productCatalogServiceUrl;
    } else if (req.path.startsWith('/orders')) {
      return orderManagementServiceUrl;
    } else if (req.path.startsWith('/payments')) {
      return paymentServiceUrl;
    } else if (req.path.startsWith('/notifications')) {
      return notificationServiceUrl;
    } else if (req.path.startsWith('/sessions')) {
      return sessionManagementServiceUrl;
    }
  }
}