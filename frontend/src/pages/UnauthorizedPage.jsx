import { ShieldAlert, CreditCard, Mail } from "lucide-react";
import { useAuth } from "../lib/auth.jsx";

export default function UnauthorizedPage() {
  const { user } = useAuth();

  function handlePay() {
    alert("Payment integration coming soon. Please contact your administrator to proceed.");
  }

  return (
    <section className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">
          <ShieldAlert size={48} />
        </div>
        <h2>Account Pending Authorization</h2>
        <p>
          Your trainer account has been created successfully, but it has not yet been authorized by an administrator.
          You do not have access to any features until your account is authorized.
        </p>

        {user?.hasPaid ? (
          <div className="unauthorized-status paid">
            <CreditCard size={18} />
            <span>Payment confirmed. Waiting for admin authorization.</span>
          </div>
        ) : (
          <div className="unauthorized-status unpaid">
            <CreditCard size={18} />
            <span>Authorization fee not yet paid.</span>
          </div>
        )}

        {!user?.hasPaid && (
          <button className="primary-button pay-button" onClick={handlePay}>
            <CreditCard size={16} /> Pay Authorization Fee
          </button>
        )}

        <div className="unauthorized-contact">
          <Mail size={16} />
          <span>Contact your administrator to authorize your account or for payment assistance.</span>
        </div>
      </div>
    </section>
  );
}
