import { DashboardCards, DashboardPageHeading, StatusBadge } from '@/components/dashboard';
import { demoPayments } from '@/lib/mock-data';

// Admins can review plan type, customer, amount, transaction ID, and payment date here.
export default function AdminTransactionsPage() {
  const revenue = demoPayments.reduce((sum, record) => sum + record.amount, 0);
  return (
    <>
      <DashboardPageHeading
        eyebrow="PAYMENTS & PLANS"
        title="Transactions"
        description="A clear record of subscription payments in the MentorLagbe community."
      />
      <DashboardCards
        items={[
          ['Total transactions', String(demoPayments.length), 'Demo payment records'],
          ['Total collected', `$${revenue}`, 'USD equivalent'],
          [
            'Tutor Pro plans',
            String(demoPayments.filter((item) => item.userRole === 'tutor').length),
            'Active demo payments',
          ],
          [
            'Student Pro plans',
            String(demoPayments.filter((item) => item.userRole === 'student').length),
            'Active demo payments',
          ],
        ]}
      />
      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Payment records</h2>
            <p className="panel-subtitle">Transaction history and subscription details.</p>
          </div>
          <span className="status-pill">All payments · USD</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Transaction ID</th>
                <th>Payment date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {demoPayments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <strong>{payment.userName}</strong>
                    <small className="table-subtext">{payment.userEmail}</small>
                  </td>
                  <td className="capitalize">{payment.userRole}</td>
                  <td>{payment.planName}</td>
                  <td>
                    ${payment.amount.toFixed(2)} {payment.currency}
                  </td>
                  <td className="transaction-id">{payment.transactionId}</td>
                  <td>
                    {new Date(payment.paidAt).toLocaleDateString('en-BD', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <StatusBadge status={payment.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
