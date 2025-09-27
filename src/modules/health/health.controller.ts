import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      message: 'Printing Discount Platform API is running',
      timestamp: new Date().toISOString(),
    };
  }
}