export interface AuthModel {
  userId: number;
  userName: string;
  userRole: string;
  userEmail: string;
}

export interface RegisterModel {
  username: string;
  email: string;
  password: string;
}
