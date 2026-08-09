import { CustomerRequestView } from "@/components/requests/CustomerRequestView";

export default async function CustomerRequestPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <CustomerRequestView token={token} />;
}
