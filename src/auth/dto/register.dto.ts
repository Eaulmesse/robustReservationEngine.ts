import { UserRole } from '../../../generated/prisma';

export class RegisterDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: UserRole;
  phone?: string;
  description?: string;
  address?: string;
}
