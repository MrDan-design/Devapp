import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PlanCard from './PlanCard';
import './UpgradePage.css'; // for styling
import { useNavigate } from 'react-router-dom';

const UpgradePage = () => {
  const [plans, setPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // pagination index
  const [userPlan, setUserPlan] = useState('');

  const navigate = useNavigate();

  const cardsPerPage = 3;

  useEffect(() => {
  // Fetch subscription plans (no auth needed)
  axios.get('http://localhost:5000/api/subscriptions')
    .then(res => setPlans(res.data))
    .catch(err => console.error('Failed to fetch plans:', err));

  // Fetch user profile (auth needed)
  const token = localStorage.getItem('token'); // or sessionStorage.getItem

  if (token) {
    axios.get('http://localhost:5000/api/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setUserPlan(res.data.plan))
    .catch(err => console.error('Failed to fetch user profile:', err.response?.data || err.message));
  } else {
    console.warn('No token found – user might not be logged in');
  }
}, []);

  const handleSelectPlan = (plan) => {
    localStorage.setItem('selected_plan', JSON.stringify(plan));
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/checkout', { state: { selectedPlan: plan } });
    } else {
      navigate('/login');
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

        <div className="plan-carousel">
          {currentPage > 0 && <button className="arrow-btn left" onClick={handlePrev}>‹</button>}

          <div className="plan-cards">
            {visiblePlans.map((plan, index) => (
              <PlanCard
                key={index}
                plan={plan}
                isActive={plan.name === userPlan}
                onSelect={() => handleSelectPlan(plan)}
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
