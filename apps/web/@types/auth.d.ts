import { Session, User } from "lucia";

declare global {
  interface ValidateRequest {
    session: Session | null;
    user: User | null;
  }

  interface RegisterFormInputs {
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    password: string;
  }
}
