import { LoginFormClient, type LoginFormClientProps } from "./LoginFormClient";

export type LoginFormProps = LoginFormClientProps;

export const LoginForm = ({ loginWithEmail, defaultEmail }: LoginFormProps) => {
  return <LoginFormClient loginWithEmail={loginWithEmail} defaultEmail={defaultEmail} />;
};
