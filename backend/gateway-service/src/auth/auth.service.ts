import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';


@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    async validateUser(username: string, pass: string): Promise<any> {
        try {
        const response = await axios.post('http://localhost:3000/users/validate', {
            username,
            password: pass,
        });
        const { isValid, userId } = response.data;
        if (isValid) {
            return { userId, username };
        }
        return null;
        } catch (error) {
        throw new Error('User validation failed');
        }
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
        access_token: this.jwtService.sign(payload),
        };
    }
}