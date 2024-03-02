import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
    // constructor(private jwtService: JwtService) {}

    // async validateUser(username: string, pass: string): Promise<any> {
    //     try {
    //     const response = await axios.post('http://localhost:3000/users/validate', {
    //         username,
    //         password: pass,
    //     });
    //     const { isValid, userId } = response.data;
    //     if (isValid) {
    //         return { userId, username };
    //     }
    //     return null;
    //     } catch (error) {
    //     throw new Error('User validation failed');
    //     }
    // }

    // async login(user: any) {
    //     const payload = { username: user.username, sub: user.userId };
    //     return {
    //     access_token: this.jwtService.sign(payload),
    //     };
    // }
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService // Inject ConfigService to access environment variables
    ) {}

    async validateUser(username: string, pass: string): Promise<any> {
        try {
            // Use ConfigService to get the URL, enhances security and flexibility
            const userValidateUrl = this.configService.get('USER_SERVICE_URL') + '/users/validate';
            const response = await axios.post(userValidateUrl, {
                username,
                password: pass,
            });

            const { isValid, userId, role } = response.data; // Assuming the role is also returned
            if (isValid) {
                return { userId, username, role };
            }
            return null;
        } catch (error) {
            // Enhanced error handling
            if (error.response && error.response.status === HttpStatus.UNAUTHORIZED) {
                throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
            } else {
                throw new HttpException('User validation failed', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async login(user: any) {
        const payload = {
            username: user.username,
            sub: user.userId,
            role: user.role 
        };

        // Utilizing environmental variables for JWT secret and other options
        return {
            access_token: this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_SECRET'), // Use ConfigService to access the JWT_SECRET
                expiresIn: this.configService.get('JWT_EXPIRATION_TIME'), // Example: '60s', '1h', '7d'
            }),
        };
    }
}