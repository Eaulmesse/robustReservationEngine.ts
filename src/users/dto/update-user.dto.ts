import { UserRole } from '../../../generated/prisma';

export class UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: UserRole;
  phone?: string;
  description?: string;
  address?: string;
  isActive?: boolean;
}
