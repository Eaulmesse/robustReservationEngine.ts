export class CreateProviderDto {
  name: string;
  email: string;
  description?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}
