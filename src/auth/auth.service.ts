import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID')
    );
  }

  async verifyGoogleToken(token: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: this.configService.get('GOOGLE_CLIENT_ID'),
    });
    
    const payload = ticket.getPayload();

    if (!payload) {
      throw new UnauthorizedException('Token Google invalide');
    }

    return {
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      googleId: payload.sub,
    };
  }

  async findOrCreateGoogleUser(
    googleData: any,
    googleAccessToken: string,
    googleRefreshToken?: string,
  ) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleData.email },
    });

    if (!user) {
      // Créer un nouvel utilisateur avec les tokens Google
      user = await this.prisma.user.create({
        data: {
          email: googleData.email,
          firstName: googleData.firstName,
          lastName: googleData.lastName,
          password: '', // Pas de mot de passe pour les comptes Google
          role: 'CLIENT',
          googleAccessToken,
          googleRefreshToken: googleRefreshToken || null,
          googleCalendarId: googleData.email, // Par défaut, l'email est l'ID du calendrier principal
        },
      });
    } else {
      // Mettre à jour les tokens Google pour un utilisateur existant
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleAccessToken,
          googleRefreshToken: googleRefreshToken || user.googleRefreshToken, // Garde l'ancien si pas de nouveau
          googleCalendarId: user.googleCalendarId || googleData.email,
        },
      });
    }

    const { password: _, ...result } = user;
    return result;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
    });

    const { password: _, ...result } = user;
    return {
      user: result,
      access_token: this.generateToken(user),
    };
  }

  async login(user: any) {
    return {
      user,
      access_token: this.generateToken(user),
    };
  }

  private generateToken(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return user;
  }

  /**
   * Rafraîchit le token d'accès Google en utilisant le refresh token
   * @param userId - ID de l'utilisateur
   * @returns Nouveau access token
   */
  async refreshGoogleAccessToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { googleRefreshToken: true },
    });

    if (!user?.googleRefreshToken) {
      throw new UnauthorizedException(
        "L'utilisateur n'a pas de refresh token Google",
      );
    }

    try {
      // Configurer le client OAuth avec le refresh token
      this.googleClient.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      // Rafraîchir le token
      const { credentials } = await this.googleClient.refreshAccessToken();
      const newAccessToken = credentials.access_token;

      if (!newAccessToken) {
        throw new UnauthorizedException('Impossible de rafraîchir le token');
      }

      // Sauvegarder le nouveau access token
      await this.prisma.user.update({
        where: { id: userId },
        data: { googleAccessToken: newAccessToken },
      });

      return newAccessToken;
    } catch (error) {
      console.error('Erreur rafraîchissement token Google:', error);
      throw new UnauthorizedException('Token Google invalide ou expiré');
    }
  }

  /**
   * Récupère un access token Google valide (rafraîchit si nécessaire)
   * @param userId - ID de l'utilisateur
   * @returns Access token valide
   */
  async getValidGoogleAccessToken(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { googleAccessToken: true, googleRefreshToken: true },
    });

    if (!user?.googleAccessToken) {
      return null;
    }

    // TODO: Vérifier si le token est expiré (nécessite de stocker expiry_date)
    // Pour l'instant, on suppose qu'il est valide
    // Si l'API Google renvoie une erreur 401, il faudra appeler refreshGoogleAccessToken()

    return user.googleAccessToken;
  }

  /**
   * Met à jour les tokens Google d'un utilisateur existant
   * @param userId - ID de l'utilisateur
   * @param googleAccessToken - Nouveau access token
   * @param googleRefreshToken - Nouveau refresh token (optionnel)
   */
  async updateGoogleTokens(
    userId: string,
    googleAccessToken: string,
    googleRefreshToken?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, googleCalendarId: true },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken,
        googleRefreshToken: googleRefreshToken || undefined,
        googleCalendarId: user.googleCalendarId || user.email,
      },
    });
  }

  /**
   * Supprime les tokens Google d'un utilisateur (déconnexion)
   * @param userId - ID de l'utilisateur
   */
  async removeGoogleTokens(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleCalendarId: null,
      },
    });
  }
}
