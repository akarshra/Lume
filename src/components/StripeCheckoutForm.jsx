import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripeCheckoutForm = ({ amountStr, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:5173/success',
      },
      redirect: 'if_required',
    });

    if (error) {
      // This displays the exact stripe error like "Your card was declined"
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-embedded-form" style={{ marginTop: '16px' }}>
      <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px', marginBottom: '16px' }}>
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div style={{ color: '#d9534f', backgroundColor: '#f9eaea', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid #d9534f' }}>
          <strong>Payment Failed:</strong> {errorMessage}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isProcessing}
          className="btn-secondary"
          style={{ flex: 1 }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="btn-primary"
          style={{ flex: 2 }}
        >
          {isProcessing ? 'Processing...' : `Pay ${amountStr} Now`}
        </button>
      </div>
    </form>
  );
};

export default StripeCheckoutForm;
