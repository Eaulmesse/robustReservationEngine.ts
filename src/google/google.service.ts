import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Crée un événement Google Calendar avec lien Google Meet
   * @param accessToken - Token d'accès Google du provider
   * @param appointmentData - Données du rendez-vous
   * @returns Lien Meet, ID événement, ID calendrier
   */
  async createMeetEvent(
    accessToken: string,
    appointmentData: {
      startTime: Date;
      endTime: Date;
      summary: string;
      description?: string;
      attendeeEmail?: string;
    },
  ) {
    try {
      // Créer un client OAuth avec le token d'accès
      const oauth2Client = new OAuth2Client(
        this.configService.get('GOOGLE_CLIENT_ID'),
      );
      oauth2Client.setCredentials({ access_token: accessToken });

      // Initialiser l'API Calendar
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Créer l'événement avec Google Meet
      const event = {
        summary: appointmentData.summary,
        description: appointmentData.description || '',
        start: {
          dateTime: appointmentData.startTime.toISOString(),
          timeZone: 'Europe/Paris', // Ajuste selon ta timezone
        },
        end: {
          dateTime: appointmentData.endTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        attendees: appointmentData.attendeeEmail
          ? [{ email: appointmentData.attendeeEmail }]
          : [],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`, // ID unique pour la requête
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };

      // Créer l'événement (conferenceDataVersion=1 pour activer Meet)
      const response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event,
      });

      // Extraire les données
      const meetingLink =
        response.data.conferenceData?.entryPoints?.[0]?.uri || null;
      const googleEventId = response.data.id;
      const googleCalendarId = response.data.organizer?.email || 'primary';

      return {
        meetingLink,
        googleEventId,
        googleCalendarId,
      };
    } catch (error) {
      console.error('Erreur création événement Google Calendar:', error);
      throw new BadRequestException(
        'Impossible de créer le lien Google Meet',
      );
    }
  }

  /**
   * Supprime un événement Google Calendar
   * @param accessToken - Token d'accès Google du provider
   * @param eventId - ID de l'événement à supprimer
   */
  async deleteEvent(accessToken: string, eventId: string) {
    try {
      const oauth2Client = new OAuth2Client(
        this.configService.get('GOOGLE_CLIENT_ID'),
      );
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur suppression événement Google Calendar:', error);
      throw new BadRequestException(
        "Impossible de supprimer l'événement Google",
      );
    }
  }
}
