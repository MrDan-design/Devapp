import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import "./CheckoutPage.css"

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlan = location.state?.selectedPlan;
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const planId = selectedPlan?.id;

      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('planId', planId);
      formData.append('paymentProof', paymentProof);

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/subscriptions/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Subscription request submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error submitting subscription request:', err);
      alert('Error submitting. Try again.');
    }
  };

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/deposit/wallets`);
        setWallets(res.data);
        if (res.data.length > 0) {
          setSelectedWallet(res.data[0].address);
        }
      } catch (err) {
        console.error('Error fetching wallet addresses:', err);
      }
    };

    fetchWallets();
  }, []);

  const handleCopy = () => {
    if (selectedWallet) {
      navigator.clipboard.writeText(selectedWallet);
      alert('Wallet address copied!');
    }
  };

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-card">
        <h3 className="mb-3">Complete Your Subscription</h3>
        <p className="text-muted">Plan: <strong>{selectedPlan?.name || 'N/A'}</strong></p>

        <div className="mb-4">
          <h5>Select Wallet:</h5>
          <div className="wallet-selector">
            <select
              className="form-control"
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
            >
              {wallets.map((wallet, index) => (
                <option key={index} value={wallet.address}>
                  {wallet.crypto_type} - {wallet.address}
                </option>
              ))}
            </select>
            <button className="btn btn-outline-secondary" onClick={handleCopy}>
              Copy
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmitRequest}>
          <div className="form-group mb-3">
            <label htmlFor="paymentProof" className="form-label">Upload Payment Screenshot</label>
            <input
              type="file"
              className="form-control-file form-control"
              id="paymentProof"
              onChange={(e) => setPaymentProof(e.target.files[0])}
              accept="image/*"
              required
            />
          </div>

          <div className="action-buttons">
            <button type="submit" className="btn btn-primary">
              Submit for Approval
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => navigate('/upgrade-plan')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
      

  );
};

export default CheckoutPage;
