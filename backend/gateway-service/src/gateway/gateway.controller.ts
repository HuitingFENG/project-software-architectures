import { Controller, All, Req, Res, HttpStatus, UseGuards, HttpException, Body, Post, Get, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthGuard } from '@nestjs/passport';
import { Observable, map } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class GatewayController {
    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) {}

    @Get('test')
    testRoute(@Res() res: Response) {
        console.log('Test route hit'); 
        res.status(HttpStatus.OK).json({ message: 'This is a test endpoint and does not require authentication' });
    }

    @Post('login')
    login(@Body() credentials: any): Observable<any> {
        console.log('Login route hit');
        const userServiceUrl = this.configService.get('USER_SERVICE_URL');
        return this.httpService.post(`${userServiceUrl}/users/login`, credentials)
            .pipe(
                map(response => response.data),
            );
    }

    @Post('start-session')
    @UseGuards(AuthGuard('jwt'))
    async startSession(@Body() body, @Req() req) {
        console.log("Start-session route hit");
        const { qrCode } = body;

        const sessionManagementServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const validAlleyResponse = await this.httpService.get(`${sessionManagementServiceUrl}/sessions/getCatalogForQRCode`, { params: { qrCode } }).toPromise();
        if (!validAlleyResponse.data.isValid) {
            throw new HttpException('Invalid QR Code', HttpStatus.BAD_REQUEST);
        } else {
            const sessionResponse = await this.httpService.post(`${sessionManagementServiceUrl}/sessions/add`, {
                customerId: [ req.user._id ],
                qrCode,
                orders: [],
                status: 'active'
            }).toPromise();
            return sessionResponse.data;
        }
    }

    

    // @Post('close-session')
    // @UseGuards(AuthGuard('jwt'))
    // async closeSession(@Body() body, @Req() req) {
    //     const { sessionId } = body;
    //     const closeSessionResponse = await this.httpService.put(`${process.env.SESSION_MANAGEMENT_SERVICE_URL}/sessions/${sessionId}`, {
    //         status: 'closed'
    //     }).toPromise();

    //     return closeSessionResponse.data;
    // }
    










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

    


    




    // @Post('login')
    // async login(@Body() credentials: any, @Res() res: Response) {
    //     const userServiceUrl = this.configService.get('USER_SERVICE_URL');
    //     console.log('UserService URL:', userServiceUrl);

    //     try {
            
    //         const response = await this.httpService.post(`${userServiceUrl}/users/login`, credentials).toPromise();
    //         const token = response.data.token; 
    //         console.log("Token: ", token);
    //         return res.status(HttpStatus.OK).json({ token });

    //     } catch (error) {
    //         console.error('Login error:', error);
    //         return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Login failed', error: error.response.data });
    //     }
    // }

    // @Post('start-session')
    // @UseGuards(AuthGuard('jwt'))
    // async startSession(@Body() body, @Req() req, @Res() res: Response) {
    //     console.log("TEST for startSession");
    //     const { qrCode } = body;
    //     const sessionManagementServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
    //     try {
    //         const validAlleyResponse = await this.httpService.get(`${sessionManagementServiceUrl}/sessions/getCatalogForQRCode`, { params: { qrCode } }).toPromise();
    //         if (!validAlleyResponse.data.isValid) {
    //             throw new HttpException('Invalid QR Code', HttpStatus.BAD_REQUEST);
    //         }

    //         const sessionResponse = await this.httpService.post(`${process.env.SESSION_MANAGEMENT_SERVICE_URL}/sessions/add`, {
    //             customerId: [ req.user._id ],
    //             qrCode,
    //             orders: [], // Assume an empty orders array for now
    //             status: 'active'
    //         }).toPromise();

    //         return res.status(HttpStatus.OK).json(sessionResponse.data);

    //     } catch (error) {
    //         return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Could not start session', error: error.response.data });
    //     }
    // }

}