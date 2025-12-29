import LoginClient from "./LoginClient";

export const metadata = {
  title: "Log In | AMBIT",
  description: "Log in to view your match history.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextParam =
    typeof searchParams?.next === "string" ? searchParams.next : "";

  const safeNext = nextParam.startsWith("/") ? nextParam : "";

  return <LoginClient safeNext={safeNext} />;
}
