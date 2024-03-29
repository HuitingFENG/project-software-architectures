import { Controller, All, Req, Res, HttpStatus, UseGuards, HttpException, Body, Post, Get, Param, Patch, Put, Delete } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthGuard } from '@nestjs/passport';
import { Observable, catchError, forkJoin, lastValueFrom, map, mergeMap, of } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import Stripe from 'stripe';


interface Order {
    id: any; 
}

interface orders {
    order: Order;
}

@Controller()
export class GatewayController {
    // orders: orders;
    
    stripe: any;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) {
        this.stripe = new Stripe(this.configService.get('STRIPE_SECRET'), {
            apiVersion: '2023-10-16',
        });
    }

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
        console.log("req.user.id: ", req.user.id);
        console.log("req.user.name: ", req.user.name);
        console.log("req.user.email: ", req.user.email);

        const { qrCode } = body;

        const sessionManagementServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const validAlleyResponse = await this.httpService.get(`${sessionManagementServiceUrl}/sessions/getCatalogForQRCode`, { params: { qrCode } }).toPromise();
        if (!validAlleyResponse.data.isValid) {
            throw new HttpException('Please choose another alley, this alley is active/occupied. - Invalid QR Code', HttpStatus.BAD_REQUEST);
        } else {
            const sessionResponse = await this.httpService.post(`${sessionManagementServiceUrl}/sessions/add`, {
                customers: [ req.user.id ],
                qrCode,
                orders: [],
                status: 'active',
                needToPay: 0,
                restToPay: 0,
                notifications: [],
            }).toPromise();
            // return sessionResponse.data;

            console.log('Session created with ID:', sessionResponse.data.session._id);
            return {
                sessionId: sessionResponse.data.session._id, 
                message: 'Session started successfully',
                ...sessionResponse.data
            };
        }
    }


    @Put('/add-members-into-session/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async addMembersIntoSession(@Param('sessionId') sessionId: string, @Body() updateBody: any, @Req() req) {
        console.log("Add-members-into-session route hit");
        console.log("sessionId, updateBody: ", sessionId, updateBody);

        const sessionManagementServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        try {
            const response = await this.httpService.put(`${sessionManagementServiceUrl}/sessions/${sessionId}`, updateBody).toPromise();
            return response.data;
        } catch (error) {
            throw new HttpException(error.response?.data || 'Failed to update session', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('/create-order-into-session/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async createOrderIntoSession(@Param('sessionId') sessionId: string, @Body() orderDetails: any, @Req() req) {
        console.log("Create-order-into-session route hit");
        console.log("sessionId, updateBody: ", sessionId, orderDetails);

        const orderServiceUrl = this.configService.get('ORDER_MANAGEMENT_SERVICE_URL');
        const sessionManagementServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        console.log("orderServiceUrl: ", orderServiceUrl);
        console.log("sessionManagementServiceUrl: ", sessionManagementServiceUrl);

        console.log("orderDetails: ", orderDetails);
        const orderDetailsPayload = {
            products: orderDetails.products,
            customers: [ { "email": req.user.email } ],
            sessionId: sessionId,
        }
        console.log("orderDetailsPayload: ", orderDetailsPayload);

        try {
        const orderResponse = await this.httpService.post(`${orderServiceUrl}/orders`, orderDetailsPayload).toPromise();
        const orderData = orderResponse.data;
        console.log("orderData: ", orderData);

        const sessionUpdatePayload = {
            orders: [ orderData.id ], 
            orderDetails: { totalPrice: orderData.totalPrice }
        };
        console.log("sessionUpdatePayload: ", sessionUpdatePayload);

        const sessionUpdateResponse = await this.httpService.put(`${sessionManagementServiceUrl}/sessions/${sessionId}/add-order`, sessionUpdatePayload).toPromise();
        console.log("sessionUpdateResponse.data: ", sessionUpdateResponse.data);


        return {
            message: 'Order created and added to session successfully',
            order: orderResponse.data,
            session: sessionUpdateResponse.data,
        };
        } catch (error) {
        throw new HttpException('Failed to create order or update session', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('check-all-orders/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    checkAllOrders(@Param('sessionId') sessionId: string): Observable<any> {
        console.log("Check-all-orders route hit");
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const orderServiceUrl = this.configService.get('ORDER_MANAGEMENT_SERVICE_URL');
        console.log("sessionServiceUrl: ", sessionServiceUrl);
        console.log("orderServiceUrl: ", orderServiceUrl);

        return this.httpService.get(`${sessionServiceUrl}/sessions/${sessionId}`).pipe(
            mergeMap(sessionResponse => {
                const orderIds = sessionResponse.data.orders;
                if (orderIds.length === 0) {
                    return [];
                }

                const orderRequests = orderIds.map(orderId => 
                    this.httpService.get(`${orderServiceUrl}/orders/${orderId}`).pipe(
                        map(response => response.data),
                        catchError(error => {
                            throw new HttpException(`Failed to fetch order with ID ${orderId}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
                        })
                    )
                );

                return forkJoin(orderRequests); 
            }),
            catchError(error => {
                throw new HttpException(`Failed to fetch session with ID ${sessionId}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            })
        );
    }

    @Get('check-my-own-orders/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    checkMyOwnOrders(@Param('sessionId') sessionId: string, @Req() req): Observable<any> {
        console.log("Check-my-own-orders route hit");
        const customerId = req.user.id;
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const orderServiceUrl = this.configService.get('ORDER_MANAGEMENT_SERVICE_URL');
        console.log("customerId: ", customerId);
        console.log("sessionServiceUrl: ", sessionServiceUrl);
        console.log("orderServiceUrl: ", orderServiceUrl);

        return this.httpService.get(`${sessionServiceUrl}/sessions/${sessionId}`).pipe(
            mergeMap(sessionResponse => {
                const session = sessionResponse.data;
                if (!session.customers.includes(customerId)) {
                    throw new HttpException("You are not part of this session.", HttpStatus.FORBIDDEN);
                }
                const orderRequests = session.orders.map(orderId =>
                    this.httpService.get(`${orderServiceUrl}/orders/${orderId}`).pipe(
                        map(orderRes => orderRes.data)
                    )
                );
                return forkJoin(orderRequests);
            }),
            map((orders: any[]) => {
                const myOrders = orders.filter(order => order.customers.some(customer => customer.id === customerId));
                return myOrders;
            }),
            catchError(error => {
                throw new HttpException(`Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            })
        );
    }

    @Post('pay-all-orders/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async payAllOrders(@Param('sessionId') sessionId: string, @Body() paymentDto: any, @Req() req): Promise<any> {
        console.log("Pay-all-orders route hit");
        const email = req.user.email; 
        const customerId = req.user.id; 
        const orderServiceUrl = this.configService.get('ORDER_MANAGEMENT_SERVICE_URL');
        const paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL');
        const stripeUrl = this.configService.get('STRIPE_URL');
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const description = `Pay for all orders of sessionId ${sessionId} by customerId ${customerId} (customerEmail : ${email})`;
        console.log("paymentServiceUrl: ", paymentServiceUrl);
        console.log("description: ", description);

        try {
            const ordersObservable = this.httpService.get(`${orderServiceUrl}/orders/session/${sessionId}`);
            const ordersResponse = await lastValueFrom(ordersObservable);
            const orders = ordersResponse.data;
            const totalPrice = orders.reduce((acc, order) => acc + order.totalPrice, 0);
            console.log("totalPrice: ", totalPrice);

            const paymentResponse = await this.httpService.post(`${paymentServiceUrl}/payments`, {
                amount: totalPrice * 100, // at least more than 0.5 euro due to Stripe limitation pf payment by visa card   
                payment_method: "pm_card_visa",
                currency: "eur",
                customerEmail: email,
                customerId: customerId,
                description: description,
            }).toPromise();
            console.log("paymentResponse: ", paymentResponse);
            console.log("paymentResponse.data: ", paymentResponse.data);

            // Update the session's restToPay to 0 after successful payment
            await this.httpService.put(`${sessionServiceUrl}/sessions/${sessionId}`, {
                restToPay: 0
            }).toPromise();
            console.log(`Session ${sessionId} restToPay updated to 0`);

            // Assuming paymentResponse.data is the structure shared in your message
            const paymentRecordObject = paymentResponse.data.find(item => item.paymentRecord);
            const invoiceDescription = paymentRecordObject ? paymentRecordObject.paymentRecord.invoice : "Default invoice description";
            console.log("invoiceDescription: ", invoiceDescription);

            // After successful payment logic inside payAllOrders or payMyOwnOrders
            await this.createNotificationAndUpdateSession(sessionId, invoiceDescription, email);

            await this.updateOrdersAfterPaymentForAllOrders(sessionId, paymentResponse.data);

            await this.updateSessionStatusIfPaidOff(sessionId);
            
            return paymentResponse.data;
        } catch (error) {
            throw new HttpException('Payment processing failed: ' + error.message, HttpStatus.BAD_REQUEST);
        }
    }



    @Post('pay-my-own-orders/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async payMyOwnOrders(@Param('sessionId') sessionId: string, @Body() paymentDto: any, @Req() req): Promise<any> {
        console.log("Pay-my-own-orders route hit");
        const email = req.user.email; 
        const customerId = req.user.id;
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const orderServiceUrl = this.configService.get('ORDER_MANAGEMENT_SERVICE_URL');
        const paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL');


        try {
            const sessionResponse = await this.httpService.get(`${sessionServiceUrl}/sessions/${sessionId}`).toPromise();
            const session = sessionResponse.data;

            if (!session.customers.includes(customerId)) {
                throw new HttpException("You are not part of this session.", HttpStatus.FORBIDDEN);
            }

            const orders = await Promise.all(session.orders.map(orderId =>
                this.httpService.get(`${orderServiceUrl}/orders/${orderId}`).toPromise()
            ));

            const myOrders = orders
                .map(response => response.data)
                .filter(order => order.customers.some(customer => customer.id === customerId));

            const totalPrice = myOrders.reduce((acc, order) => acc + order.totalPrice, 0);
            console.log("myOrders: ", myOrders);
            console.log(`Total price for my orders: ${totalPrice}`);

            const paymentResponse = await this.httpService.post(`${paymentServiceUrl}/payments`, {
                amount: totalPrice * 100,
                payment_method: "pm_card_visa",
                currency: "eur",
                customerEmail: email,
                customerId: customerId,
                description: `Pay for all orders for sessionId ${sessionId} by customerId ${customerId} (customerEmail : ${email})`,
            }).toPromise();
            console.log("paymentResponse: ", paymentResponse);
            console.log("paymentResponse.data: ", paymentResponse.data);

            // Update the session's restToPay after successful payment
            const updatedSessionResponse = await this.httpService.put(`${sessionServiceUrl}/sessions/${sessionId}`, {
                restToPay: session.restToPay - totalPrice
            }).toPromise();
    
            // Assuming paymentResponse.data is the structure shared in your message
            const paymentRecordObject = paymentResponse.data.find(item => item.paymentRecord);
            const invoiceDescription = paymentRecordObject ? paymentRecordObject.paymentRecord.invoice : "Default invoice description";
            console.log("invoiceDescription: ", invoiceDescription);

            // After successful payment logic inside payAllOrders or payMyOwnOrders
            await this.createNotificationAndUpdateSession(sessionId, invoiceDescription, email);


            // updateOrdersAfterPaymentForAllMyOwnOrders
            const updatePromises = myOrders.map(order => {
                const existingPayments = Array.isArray(order.payments) ? order.payments : [];

                this.httpService.patch(`${orderServiceUrl}/orders/${order.id}`, {
                    status: 'paid',
                    payments: [...existingPayments, paymentResponse.data], 
                }).toPromise()
            });
            await Promise.all(updatePromises);
            console.log("updatePromises: ", updatePromises);

            await this.updateSessionStatusIfPaidOff(sessionId);

            return { message: "Orders updated successfully",  myOrders, totalPrice };

        } catch (error) {
            console.error(`Error: ${error.message}`);
            throw new HttpException(`Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Post('pay-part-of-all-orders/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async payPartOfOrders(@Param('sessionId') sessionId: string, @Body() paymentDto: any, @Req() req): Promise<any> {
        console.log("Pay-part-of-all-orders route hit");

        // Step 1: Validate the user is part of the session
        const email = req.user.email; 
        const customerId = req.user.id; 
        const orderServiceUrl = this.configService.get('ORDER_MANAGEMENT_SERVICE_URL');
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const sessionResponse = await lastValueFrom(this.httpService.get(`${sessionServiceUrl}/sessions/${sessionId}`));
        const session = sessionResponse.data;
        const description = `Pay for all orders of sessionId ${sessionId} by customerId ${customerId} (customerEmail : ${email})`;
        console.log("session: ", session);
        console.log("paymentDto: ", paymentDto);
        console.log("paymentDto.amount: ", paymentDto.amount);

        if (!session.customers.includes(req.user.id)) {
            throw new HttpException("You are not part of this session.", HttpStatus.FORBIDDEN);
        }

        // Step 2: Process the payment
        const paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL');
        const paymentResponse = await lastValueFrom(this.httpService.post(`${paymentServiceUrl}/payments`, {
            amount: paymentDto.amount * 100,
            payment_method: "pm_card_visa",
            currency: "eur",
            customerEmail: email,
            customerId: customerId,
            description: description,
        }));
        console.log("paymentResponse: ", paymentResponse);

        // Assuming paymentResponse.data is the structure shared in your message
        const paymentRecordObject = paymentResponse.data.find(item => item.paymentRecord);
        const invoiceDescription = paymentRecordObject ? paymentRecordObject.paymentRecord.invoice : "Default invoice description";
        console.log("invoiceDescription: ", invoiceDescription);
        const returnedPaymentId = paymentRecordObject ? paymentRecordObject.paymentRecord.id : "Default payment id";
        console.log("returnedPaymentId: ", returnedPaymentId);

        // After successful payment logic inside payAllOrders or payMyOwnOrders
        await this.createNotificationAndUpdateSession(sessionId, invoiceDescription, email);

        // Step 3: Update all orders in the session with the payment record
        const ordersResponse = await this.httpService.get(`${orderServiceUrl}/orders/session/${sessionId}`).toPromise();
        const orders = ordersResponse.data;

        orders.forEach(async (order) => {
            const existingPayments = Array.isArray(order.payments) ? order.payments : [];
            console.log("existingPayments: ", existingPayments);
            const updateBody = {
                status: 'paid',
                payments: [ ...existingPayments, returnedPaymentId ],
            };
            console.log("updateBody: ", updateBody);
            await this.httpService.patch(`${orderServiceUrl}/orders/${order.id}`, updateBody).toPromise();
        });

        console.log("Orders updated successfully");

        // Step 4: Update session's restToPay
        const newRestToPay = session.restToPay - paymentDto.amount;
        console.log("newRestToPay: ", newRestToPay);
        await this.httpService.put(`${sessionServiceUrl}/sessions/${sessionId}`, {
            restToPay: newRestToPay > 0 ? newRestToPay : 0,
        }).toPromise();

        await this.updateSessionStatusIfPaidOff(sessionId);

        return { message: "Partial payment made successfully", paymentDetails: paymentResponse.data };
    }















    @Get('/check-all-details-of-session/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async checkAllSessionDetails(@Param('sessionId') sessionId: string): Promise<any> {
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const orderServiceUrl = this.configService.get('ORDER_MANAGEMENT_SERVICE_URL');
        const customerServiceUrl = this.configService.get('USER_SERVICE_URL'); 
        const notificationServiceUrl = this.configService.get('NOTIFICATION_SERVICE_URL'); 

        try {
            // Fetch session details
            const sessionResponse = await this.httpService.get(`${sessionServiceUrl}/sessions/${sessionId}`).toPromise();
            const session = sessionResponse.data;

            // Parallel requests to fetch details based on IDs
            const orderDetailsPromises = session.orders.map(orderId =>
                this.httpService.get(`${orderServiceUrl}/orders/${orderId}`).toPromise()
            );
            const customerDetailsPromises = session.customers.map(customerId =>
                this.httpService.get(`${customerServiceUrl}/users/${customerId}`).toPromise() 
            );
            const notificationDetailsPromises = session.notifications.map(notificationId =>
                this.httpService.get(`${notificationServiceUrl}/notifications/${notificationId}`).toPromise()
            );

            // Wait for all promises to resolve
            const [orderDetails, customerDetails, notificationDetails] = await Promise.all([
                Promise.all(orderDetailsPromises),
                Promise.all(customerDetailsPromises),
                Promise.all(notificationDetailsPromises),
            ]);

            // Combine and return details
            return {
                session: {
                    ...session,
                    orders: orderDetails.map(response => response.data),
                    customers: customerDetails.map(response => response.data),
                    notifications: notificationDetails.map(response => response.data),
                }
            };
        } catch (error) {
            throw new HttpException('Failed to fetch session details: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/check-bill-of-session/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async checkBillOfSession(@Param('sessionId') sessionId: string): Promise<any> {
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');

        try {
            const sessionResponse = await this.httpService.get(`${sessionServiceUrl}/sessions/${sessionId}`).toPromise();
            const session = sessionResponse.data;

            return {
                session
            };
        } catch (error) {
            throw new HttpException('Failed to fetch customer details: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Get('/check-all-customers-of-session/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async checkSessionCustomers(@Param('sessionId') sessionId: string): Promise<any> {
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const customerServiceUrl = this.configService.get('USER_SERVICE_URL');

        try {
            const sessionResponse = await this.httpService.get(`${sessionServiceUrl}/sessions/${sessionId}`).toPromise();
            const session = sessionResponse.data;

            const customerDetailsPromises = session.customers.map(customerId =>
                this.httpService.get(`${customerServiceUrl}/users/${customerId}`).toPromise()
            );

            const customerDetails = await Promise.all(customerDetailsPromises);

            return {
                customers: customerDetails.map(response => response.data)
            };
        } catch (error) {
            throw new HttpException('Failed to fetch customer details: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/check-all-orders-of-session/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async checkSessionOrders(@Param('sessionId') sessionId: string): Promise<any> {
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const orderServiceUrl = this.configService.get('ORDER_MANAGEMENT_SERVICE_URL');

        try {
            const sessionResponse = await this.httpService.get(`${sessionServiceUrl}/sessions/${sessionId}`).toPromise();
            const session = sessionResponse.data;

            const orderDetailsPromises = session.orders.map(orderId =>
                this.httpService.get(`${orderServiceUrl}/orders/${orderId}`).toPromise()
            );

            const orderDetails = await Promise.all(orderDetailsPromises);

            return {
                orders: orderDetails.map(response => response.data)
            };
        } catch (error) {
            throw new HttpException('Failed to fetch order details: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/check-all-notifications-of-session/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async checkSessionNotifications(@Param('sessionId') sessionId: string): Promise<any> {
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
        const notificationServiceUrl = this.configService.get('NOTIFICATION_SERVICE_URL');

        try {
            const sessionResponse = await this.httpService.get(`${sessionServiceUrl}/sessions/${sessionId}`).toPromise();
            const session = sessionResponse.data;

            const notificationDetailsPromises = session.notifications.map(notificationId =>
                this.httpService.get(`${notificationServiceUrl}/notifications/${notificationId}`).toPromise()
            );

            const notificationDetails = await Promise.all(notificationDetailsPromises);

            return {
                notifications: notificationDetails.map(response => response.data)
            };
        } catch (error) {
            throw new HttpException('Failed to fetch notification details: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



     // Route for adding a new product (accessible only by agents)
     @Post('add-products-by-agent')
     @UseGuards(AuthGuard('jwt')) 
     async addProduct(@Req() req, @Body() productData: any): Promise<any> {
        console.log("Add-products-by-agent route hit");
        console.log("role: ", req.user.role);
        if (req.user.role !== 'agent') {
            throw new HttpException('Forbidden, because the management of products is only accessible for agents.', HttpStatus.FORBIDDEN);
        }

        const productCatalogServiceUrl = this.configService.get('PRODUCT_CATALOG_SERVICE_URL');
        console.log("productCatalogServiceUrl: ", productCatalogServiceUrl);
        console.log("productData: ", productData);

        try {
            const response = await this.httpService.post(`${productCatalogServiceUrl}/products/add`, productData).toPromise();
            console.log("response.data: ", response.data);
            return response.data;
        } catch (error) {
            throw new HttpException('Failed to add product', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('view-all-products')
    @UseGuards(AuthGuard('jwt')) 
    async viewAllProducts(@Req() req, @Body() productData: any): Promise<any> {
       console.log("View-all-products route hit");

       const productCatalogServiceUrl = this.configService.get('PRODUCT_CATALOG_SERVICE_URL');
       console.log("productCatalogServiceUrl: ", productCatalogServiceUrl);
       console.log("productData: ", productData);

       try {
           const response = await this.httpService.get(`${productCatalogServiceUrl}/products`, productData).toPromise();
           console.log("response.data: ", response.data);
           return response.data;
       } catch (error) {
           throw new HttpException('Failed to view all products', HttpStatus.INTERNAL_SERVER_ERROR);
       }
   }

    @Delete('delete-product-by-agent/number/:number')
    @UseGuards(AuthGuard('jwt'))
    async deleteProduct(@Req() req, @Param('number') number: number): Promise<any> {
        console.log("Delete-product-by-agent route hit");
        if (req.user.role !== 'agent') {
            throw new HttpException('Forbidden, because the management of products is only accessible for agents.', HttpStatus.FORBIDDEN);
        }

        const productCatalogServiceUrl = this.configService.get('PRODUCT_CATALOG_SERVICE_URL');
        try {
            const response = await this.httpService.delete(`${productCatalogServiceUrl}/products/delete-by-number/${number}`).toPromise();
            console.log("Product deleted successfully:", response.data);
            return { message: 'Product deleted successfully' };
        } catch (error) {
            console.error("Failed to delete product:", error);
            throw new HttpException('Failed to delete product', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @Put('update-product-by-agent/number/:number')
    @UseGuards(AuthGuard('jwt'))
    async updateProduct(@Req() req, @Param('number') number: number, @Body() updateData: any): Promise<any> {
        console.log("Update-product-by-agent route hit");
        if (req.user.role !== 'agent') {
            throw new HttpException('Forbidden, because the management of products is only accessible for agents.', HttpStatus.FORBIDDEN);
        }

        const productCatalogServiceUrl = this.configService.get('PRODUCT_CATALOG_SERVICE_URL');
        try {
            const response = await this.httpService.put(`${productCatalogServiceUrl}/products/update-by-number/${number}`, updateData).toPromise();
            console.log("Product updated successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to update product:", error);
            throw new HttpException('Failed to update product', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    

















    @All('*')
    async handleAllRequests(@Req() req: Request, @Res() res: Response) {
        const serviceUrl = this.determineServiceUrl(req);

        if (req.user.role !== 'agent') {
            throw new HttpException('Forbidden, because all services of backend are only accessible for agents, and all agents can see all databases of all bowling parks.', HttpStatus.FORBIDDEN);
        }

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

    private async updateOrdersAfterPaymentForAllOrders(sessionId: string, paymentRecordId: string): Promise<void> {
        const orderServiceUrl = this.configService.get('ORDER_MANAGEMENT_SERVICE_URL');

        const ordersResponse = await this.httpService.get(`${orderServiceUrl}/orders/session/${sessionId}`).toPromise();
        const orders = ordersResponse.data;

        orders.forEach(async (order) => {
            const updateBody = {
                status: 'paid',
                payments: [paymentRecordId],
            };
            await this.httpService.patch(`${orderServiceUrl}/orders/${order.id}`, updateBody).toPromise();
        });

        console.log("Orders updated successfully");
    }


    private async createNotificationAndUpdateSession(sessionId, description, userEmail) {
        const notificationServiceUrl = this.configService.get('NOTIFICATION_SERVICE_URL');
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
    
        // Step 1: Create the notification
        const notificationPayload = {
            userEmail,
            message: description,
            status: 'created', // Default status
        };
    
        try {
            const notificationResponse = await this.httpService.post(`${notificationServiceUrl}/notifications/add`, notificationPayload).toPromise();
            const notificationId = notificationResponse.data.notification._id;
    
            // Step 2: Update the session's notifications array
            const sessionUpdateResponse = await this.httpService.put(`${sessionServiceUrl}/sessions/${sessionId}`, {
                $push: { notifications: notificationId }
            }).toPromise();
            console.log("sessionUpdateResponse: ", sessionUpdateResponse);

            // Step 3: Update the notification's status to "sent"
            await this.httpService.put(`${notificationServiceUrl}/notifications/${notificationId}`, {
                status: 'sent'
            }).toPromise();
    
            console.log("Notification created and session updated successfully");
        } catch (error) {
            console.error("Failed to create notification or update session:", error.message);
        }
    }
    
    
    private async updateSessionStatusIfPaidOff(sessionId: string): Promise<void> {
        const sessionServiceUrl = this.configService.get('SESSION_MANAGEMENT_SERVICE_URL');
    
        try {
            const sessionResponse = await this.httpService.get(`${sessionServiceUrl}/sessions/${sessionId}`).toPromise();
            const session = sessionResponse.data;
    
            // Check if restToPay is 0
            if (session.restToPay === 0) {
                // Update the session's status to 'vacant'
                await this.httpService.put(`${sessionServiceUrl}/sessions/${sessionId}`, {
                    status: 'closed'
                }).toPromise();
                console.log(`Session ${sessionId} status updated to 'vacant'`);
            }
        } catch (error) {
            console.error(`Failed to update session status for session ${sessionId}: ${error.message}`);
    
        }
    }

}