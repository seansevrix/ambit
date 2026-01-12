// app/get-started/page.tsx
import { Suspense } from "react";
import GetStartedClient from "./GetStartedClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
      <GetStartedClient />
    </Suspense>
  );
}
