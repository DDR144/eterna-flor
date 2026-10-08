import { Controller, Get } from '@nestjs/common';

/**
 * Lightweight keep-alive endpoint for Render's free web service.
 *
 * CRITICAL: this controller must NEVER import or inject PrismaService, and
 * must never query PostgreSQL. A cron job pings this route roughly every
 * 10 minutes to prevent Render from spinning the service down. The database
 * runs on Neon's free tier, which is limited to 100 compute-unit hours per
 * month. At Neon's minimum 0.25 CU, keeping the database awake 24/7 would
 * consume ~186 CU-hours monthly, exhausting the allowance mid-month and
 * taking the database offline. Probing the database here would turn this
 * harmless keep-alive ping into a database wake-up call.
 */
@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
    };
  }
}
