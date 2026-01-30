import ScoutingReportClient from "./ScoutingReportClient";

export default async function Page({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  return <ScoutingReportClient customerId={Number(customerId)} />;
}
