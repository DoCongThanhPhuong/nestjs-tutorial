/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { AllConfigType } from 'src/configs/config.type';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const decodedToken = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.accessTokenSecret', {
          infer: true,
        }),
      });
      const user = await this.usersService.findUserByIdWithCache(
        decodedToken?.userId,
      );
      if (!user) throw new UnauthorizedException('User not found');
      req.user = user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    next();
  }
}
