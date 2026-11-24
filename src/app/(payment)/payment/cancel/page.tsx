import { PaymentStatus } from "@/components/payment-status";

// This route explains that checkout was cancelled without changing a user’s plan.
export default function PaymentCancelPage() {
  return <PaymentStatus success={false} />;
}
