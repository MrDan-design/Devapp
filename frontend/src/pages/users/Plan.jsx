// PlanCard.jsx

import './Plan.css';
import { FaCrown, FaCircle } from 'react-icons/fa';

const PlanCard = ({ plan, isActive, onSelect }) => {
  const benefits = plan.benefits.split(',').map(b => b.trim());

  return (
    <div className={`plan-card ${isActive ? 'active' : ''}`}>
      {isActive && <FaCrown className="active-icon" />}
      <h3 className="plan-title">{plan.name}</h3>
      <p className="plan-price">${parseFloat(plan.price).toFixed(2)} <span>/monthly</span></p>

      <ul className="plan-benefits">
        {benefits.map((benefit, index) => (
          <li key={index}><FaCircle className="tick-icon" /> {benefit}</li>
        ))}
      </ul>

      <button className="select-btn" onClick={() => onSelect(plan)}>
        Select Plan
      </button>
    </div>
  );
};

export default PlanCard;
