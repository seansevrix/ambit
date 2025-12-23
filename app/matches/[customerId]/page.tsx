// app/matches/[customerId]/page.tsx
import ScoutingReportClient from "./ScoutingReportClient";

type PageProps = {
  params: Promise<{ customerId: string }>;
};

export default async function MatchesPage({ params }: PageProps) {
  const { customerId } = await params; // Next 16: params is a Promise
  const id = Number(customerId);

  return <ScoutingReportClient customerId={id} />;
}
