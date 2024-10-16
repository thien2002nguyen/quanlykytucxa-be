import { RoleAdmin } from 'src/modules/admin/interfaces/admin.interface';

export const adminAccounts = [
  {
    fullName: 'Admin',
    email: 'admin@gmail.com',
    phoneNumber: '012345678',
    password: 'admin@123',
    role: RoleAdmin.ADMIN,
  },
  {
    fullName: 'Moderator',
    email: 'moderator@gmail.com',
    phoneNumber: '123456789',
    password: 'moderator@123',
    role: RoleAdmin.MODERATOR,
  },
];
