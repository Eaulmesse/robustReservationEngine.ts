import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  /**
   * Endpoint de test pour créer un événement Google Meet
   * POST /google/test-create-event
   * Body: {
   *   "accessToken": "ya29.a0AfB_...",
   *   "summary": "Test Meeting",
   *   "startTime": "2026-01-28T15:00:00.000Z",
   *   "endTime": "2026-01-28T16:00:00.000Z",
   *   "description": "Test event",
   *   "attendeeEmail": "test@example.com"
   * }
   */
  @Post('test-create-event')
  async testCreateEvent(
    @Body()
    body: {
      accessToken: string;
      summary: string;
      startTime: string;
      endTime: string;
      description?: string;
      attendeeEmail?: string;
    },
  ) {
    const result = await this.googleService.createMeetEvent(body.accessToken, {
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      summary: body.summary,
      description: body.description,
      attendeeEmail: body.attendeeEmail,
    });

    return {
      success: true,
      data: result,
    };
  }
}
