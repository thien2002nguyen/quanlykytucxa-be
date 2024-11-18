import { RoleAuth } from 'src/modules/users/interfaces/user.interface';

export const accountsExample = [
  {
    userName: 'admin',
    email: 'admin@gmail.com',
    phoneNumber: '012345678',
    password: 'admin@123',
    role: RoleAuth.ADMIN,
  },
  {
    userName: 'moderator',
    email: 'moderator@gmail.com',
    phoneNumber: '123456789',
    password: 'moderator@123',
    role: RoleAuth.MODERATOR,
  },
];
