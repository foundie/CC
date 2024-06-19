import { Exclude } from 'class-transformer';

export class UserDto {
  name: string;
  email: string;
  followersCount: number;

  @Exclude()
  uid: string;

  @Exclude()
  password: string;

  @Exclude()
  role: string;

  @Exclude()
  location: string;

  @Exclude()
  phone: string;

  @Exclude()
  gender: string;
}
