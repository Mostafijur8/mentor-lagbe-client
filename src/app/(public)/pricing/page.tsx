import { PricingPlans } from '@/components/pricing-plans';

// The pricing route explains the free tier and role-specific Pro upgrades.
export default function PricingPage() {
  return (
    <main className="public-page">
      <section className="page-hero centered">
        <div className="eyebrow">A LITTLE MORE ROOM TO GROW</div>
        <h1>
          More focus on learning.
          <br />
          <em>Less friction.</em>
        </h1>
        <p>Start free and find your rhythm. Choose Pro when you’re ready for a little more.</p>
      </section>
      <PricingPlans />
    </main>
  );
}
