import { Role } from '../../users/enums/role.enum';
import { Permission } from '../authorization/permission.type';

export interface ActiveUserData {
  sub: number;
  email: string;
  role: Role;
  permissions: Permission[];
}
