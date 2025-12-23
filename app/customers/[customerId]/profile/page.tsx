import ProfileClient from "./ProfileClient";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ customerId: string }> | { customerId: string };
}) {
  const p: any = await params;
  const customerId = Number(p.customerId);
  return <ProfileClient customerId={customerId} />;
}
