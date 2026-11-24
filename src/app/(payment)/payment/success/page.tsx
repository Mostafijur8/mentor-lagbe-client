import { PaymentStatus } from "@/components/payment-status";

// This route confirms the frontend subscription preview and links to the matching dashboard.
export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan = "pro-student" } = await searchParams;
  return <PaymentStatus success plan={plan} />;
}
