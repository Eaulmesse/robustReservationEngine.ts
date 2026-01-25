import { UserRole } from '../../../generated/prisma';


export class CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

