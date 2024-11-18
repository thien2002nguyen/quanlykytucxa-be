import { User } from 'src/modules/users/interfaces/user.interface';

export interface UserRequest extends Request {
  auth: User;
}
