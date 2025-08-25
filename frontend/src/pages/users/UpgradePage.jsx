import { useEffect, useState } from 'react';
import axios from 'axios';
import PlanCard from './PlanCard';
import './UpgradePage.css'; // for styling
import { useNavigate } from 'react-router-dom';

const UpgradePage = () => {
  const [plans, setPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [userPlan, setUserPlan] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const cardsPerPage = 3;

  useEffect(() => {
  // In production, always use static JSON for reliability
  // In development, try API first then fallback
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    // Production: Use static JSON directly for maximum reliability
    axios.get('/subscriptions.json')
      .then(res => setPlans(res.data))
      .catch(err => console.error('Failed to fetch static subscriptions.json', err?.message || err));
  } else {
    // Development: Try API first, then fallback to static
    const apiBase = (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.startsWith('http'))
      ? import.meta.env.VITE_API_BASE_URL
      : 'http://localhost:3000/api';

    axios.get(`${apiBase}/subscriptions`)
      .then(res => setPlans(res.data))
      .catch(err => {
        console.error('Failed to fetch plans from API, falling back to static subscriptions.json', err?.message || err);
        axios.get('/subscriptions.json')
          .then(r2 => setPlans(r2.data))
          .catch(e2 => console.error('Failed to fetch local subscriptions.json', e2?.message || e2));
      });
  }

  // Fetch user subscription status
  const token = localStorage.getItem('token');

  if (token) {
    // Fetch user subscription status
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/subscriptions/status`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setSubscriptionStatus(res.data);
      if (res.data.currentPlan) {
        setUserPlan(res.data.currentPlan.name);
      }
    })
    .catch(err => console.error('Failed to fetch subscription status:', err.response?.data || err.message));

    // Fetch user profile for backwards compatibility
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      if (!userPlan && res.data.subscription_plan) {
        setUserPlan(res.data.subscription_plan);
      }
    })
    .catch(err => console.error('Failed to fetch user profile:', err.response?.data || err.message));
  } else {
    console.warn('No token found – user might not be logged in');
  }
  
  setLoading(false);
}, []);

  const handleSelectPlan = (plan) => {
    // Check if user has pending requests
    if (subscriptionStatus?.pendingRequests.length > 0) {
      alert('You already have a pending subscription request. Please wait for approval.');
      return;
    }
    
    // Check if user already has this plan
    if (subscriptionStatus?.currentPlan && subscriptionStatus.currentPlan.name === plan.name) {
      alert('You already have this subscription plan.');
      return;
    }
    
    localStorage.setItem('selected_plan', JSON.stringify(plan));
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/checkout', { state: { selectedPlan: plan } });
    } else {
      navigate('/'); // Redirect to home instead of /login
    }
  };


  const handleNext = () => {
    if ((currentPage + 1) * cardsPerPage < plans.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const visiblePlans = plans.slice(
    currentPage * cardsPerPage,
    (currentPage + 1) * cardsPerPage
  );

  return (
    <div className="upgrade-page">
      <div className="background-blur" />
      

      <div className="upgrade-container">
        <div className="top-nav d-flex position-relative w- bg-white px-3 align-items-center">
        <button className="close-btn fw-bold fs-3 border-0 bg-transparent" onClick={() => navigate('/dashboard')}>×</button>
      </div>
        <h2 className="title">ACCOUNT UPGRADE</h2>
        <p className="subtitle">Account upgrade subscription</p>

        {/* Current Subscription Status */}
        {subscriptionStatus && (
          <div className="subscription-status mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
            {subscriptionStatus.hasSubscription ? (
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success">Active</span>
                <span>Current Plan: <strong>{subscriptionStatus.currentPlan?.name}</strong></span>
              </div>
            ) : subscriptionStatus.pendingRequests.length > 0 ? (
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-warning">Pending</span>
                <span>You have a subscription request pending approval</span>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-secondary">No Plan</span>
                <span>Select a plan below to upgrade your account</span>
              </div>
            )}
          </div>
        )}

        <div className="plan-carousel">
          {currentPage > 0 && <button className="arrow-btn left" onClick={handlePrev}>‹</button>}

          <div className="plan-cards">
            {visiblePlans.map((plan, index) => (
              <PlanCard
                key={index}
                plan={plan}
                isActive={plan.name === userPlan}
                onSelect={() => handleSelectPlan(plan)}
                disabled={subscriptionStatus?.pendingRequests.length > 0}
              />
            ))}
          </div>

          {(currentPage + 1) * cardsPerPage < plans.length && (
            <button className="arrow-btn right" onClick={handleNext}>›</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
