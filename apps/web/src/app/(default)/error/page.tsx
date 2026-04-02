import { RootSystemMessageDisplay, VALID_ROOT_SYSTEM_CODES } from "../RootSystemMessageDisplay";

interface ErrorPageProps {
  searchParams: Promise<{
    source?: `login-${"AccessDenied" | "AuthorizedCallbackError"}`;
  }>;
}

const Error = async ({ searchParams }: ErrorPageProps) => {
  const { source } = await searchParams;
  return <RootSystemMessageDisplay code={source && VALID_ROOT_SYSTEM_CODES.has(source) ? source : "500"} />;
};

export default Error;
