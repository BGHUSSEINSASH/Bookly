import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'حدث خطأ غير متوقع، حاول مرة أخرى';
    let code = 'INTERNAL_ERROR';
    const details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse() as any;
      if (typeof payload === 'string') {
        message = payload;
      } else if (Array.isArray(payload?.message)) {
        message = payload.message;
        code = 'VALIDATION_ERROR';
      } else {
        message = payload?.message ?? message;
        code = payload?.code ?? httpCode(status);
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = mapPrismaError(exception);
      status = mapped.status;
      message = mapped.message;
      code = mapped.code;
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'بيانات غير صالحة';
      code = 'VALIDATION_ERROR';
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} → ${status} ${JSON.stringify(message)}`);
    }

    response.status(status).json({
      success: false,
      error: { code, message, details },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}

function httpCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE';
    case 429:
      return 'RATE_LIMITED';
    default:
      return 'INTERNAL_ERROR';
  }
}

function mapPrismaError(e: Prisma.PrismaClientKnownRequestError) {
  switch (e.code) {
    case 'P2002':
      return {
        status: HttpStatus.CONFLICT,
        message: 'هذه البيانات مسجّلة مسبقًا',
        code: 'CONFLICT',
      };
    case 'P2003':
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'مرجع غير صالح لبيانات مرتبطة',
        code: 'BAD_REQUEST',
      };
    case 'P2025':
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'العنصر المطلوب غير موجود',
        code: 'NOT_FOUND',
      };
    default:
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'خطأ في قاعدة البيانات',
        code: 'DATABASE_ERROR',
      };
  }
}
