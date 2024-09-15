import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();

    const status = exception.status ? exception.status : 500;
    const message = exception.message || 'Internal Server Error';

    return response.status(status).json({
      success: false,
      statusCode: status,
      message,
    });
  }
}
