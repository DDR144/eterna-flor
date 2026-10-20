import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
  });

  function createHost(): {
    response: { status: jest.Mock; json: jest.Mock };
    host: ArgumentsHost;
  } {
    const response: { status: jest.Mock; json: jest.Mock } = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;
    return { response, host };
  }

  function createError(code: string, message = 'Test error') {
    return new Prisma.PrismaClientKnownRequestError(message, {
      code,
      clientVersion: '5.22.0',
    });
  }

  it('should map P2002 to 409 Conflict', () => {
    const { response, host } = createHost();
    filter.catch(createError('P2002'), host);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: expect.any(String),
      }),
    );
  });

  it('should map P2025 to 404 Not Found', () => {
    const { response, host } = createHost();
    filter.catch(createError('P2025'), host);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: expect.any(String),
      }),
    );
  });

  it('should pass through an ordinary HttpException unchanged', () => {
    const { host } = createHost();
    const baseCatch = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => undefined);
    const exception = new BadRequestException('Solicitud inválida');

    filter.catch(
      exception as unknown as Prisma.PrismaClientKnownRequestError,
      host,
    );

    expect(baseCatch).toHaveBeenCalledWith(exception, host);
    baseCatch.mockRestore();
  });
});
