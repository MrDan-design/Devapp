import React from 'react';
import { Link } from 'react-router-dom';
import "./Home.css";
import bgImage from "../../assets/bg-image.jpg";


const Home = () => {
  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar d-flex justify-content-between align-items-center px-4 py-3">
        <div className="d-flex align-items-center">
          <button className="btn btn-outline-light me-2">☰</button>
          <span className="navbar-brand text-white fw-bold fs-4">TESLA Wallet</span>
        </div>

        <div className="d-flex align-items-center">
          <Link to="/login" className="btn btn-outline-light me-2">Login</Link>
          <Link to="/signup" className="btn btn-danger custom-button">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section d-flex flex-column justify-content-center align-items-start text-white px-4">
        <h1 className="display-4 fw-bold mb-3">
          Encompassing The <br /> Modern World Shares
        </h1>
        <p className="lead mb-4">Manage crypto, gift cards & investments in one place.</p>

        {/* Search Bar */}
        <div className="input-group " style={{ maxWidth: "400px" }}>
          <input
            type="text"
            className="form-control custom-input"
            placeholder="Search..."
          />
          <button className="btn btn-danger custom-btn">Search</button>
        </div>
        <div className="d-flex gap-3 mt-2">
          <button className='token-btn'>
            <img src="Bitcoin-Logo.png" alt="BTCUSD" className='me-2' width="20"/>
            BTCUSD
          </button>

          <button className='token-btn'>
            <img src="Doge-logo.png" alt="DOGE" className='me-2' width="20"/>
            DOGE
          </button>

          <button className='token-btn'>
            <img src="Tesla-Logo.png" alt="TSLA" className='me-2' width="20"/>
            TSLA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;