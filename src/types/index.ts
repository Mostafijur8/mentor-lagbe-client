// Shared frontend types mirror the MongoDB collection shapes expected from the future API.
export type Role = "student" | "tutor" | "admin";
export type Plan = "free" | "pro";
export type TuitionMode = "Online" | "Offline";
export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface UserProfile {
  name: string;
  email: string;
  role: Role;
  plan: Plan;
  image?: string;
  phone?: string;
  bio?: string;
}

export interface Tuition {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: TuitionMode;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage?: string;
  description: string;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: string;
}

export interface TuitionApplication {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorEmail: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  studentNote: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface PaymentRecord {
  _id: string;
  userEmail: string;
  userName: string;
  userRole: Role;
  planName: string;
  amount: number;
  currency: string;
  transactionId: string;
  paymentStatus: "paid";
  paidAt: string;
}
