import React from 'react';
import { Link } from 'react-router-dom';
import SupabaseAuthForm from '../../components/SupabaseAuthForm';
import "./Home.css";
import FadeIn from '../../components/FadeIn';
import bgImage from "../../assets/bg-image.jpg";
import PageWrapper from '../../components/PageWrapper';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import lgNow from '../../assets/lg-now.png';
import Btclg from '../../assets/Bitcoin-Logo.png'
import Dogelg from '../../assets/Doge-logo.png'
import Tslalg from '../../assets/Tesla-Logo.png'

const Home = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleSearchDirect = () => {
    if (query.trim() !== "") {
    const symbol = query.trim().toUpperCase();
    
    // Handle known mappings for crypto
    const mappedSymbol = symbol === "BTCUSD" ? "BTC-USD" :
                         symbol === "DOGE" ? "DOGE-USD" :
                         symbol === "TSLA" ? "TSLA-USD":
                         symbol;

    window.open(`https://finance.yahoo.com/quote/${mappedSymbol}`, "_blank");
    }
  };
  return (
    <PageWrapper>
      <div className="home-page">
      {/* Navbar */}
      <nav className="navbar d-flex justify-content-between align-items-center px-4 py-3">
        <div className="d-flex align-items-center">
          <button className="btn btn-outline-light me-2" onClick={toggleMenu} style={{
            zIndex: 300, position: 'relative'
          }}>☰</button>
          <span className="navbar-brand text-white fw-bold fs-4">
            <img src={lgNow} alt="Logo" style={{ height: "30px"}}/>
          </span>
        </div>

        <div className="d-flex align-items-center">
          <button className="btn btn-outline-light me-2" onClick={() => setShowAuth(true)}>Login</button>
          <button className="btn btn-danger custom-button" onClick={() => setShowAuth(true)}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section d-flex flex-column justify-content-center align-items-start text-white px-4">
        <h1 className="display-4 fw-bold mb-3">
          Encompassing The <br /> Modern World Shares
        </h1>

        {/* Search Bar */}
        <div className="input-group " style={{ maxWidth: "400px" }}>
          <input
            type="text"
            className="form-control custom-input"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-danger custom-btn" onClick={handleSearchDirect}>
            Search
          </button>
        </div>
        <div className="d-flex gap-3 mt-2">
          <button className='token-btn' onClick={() => handleSearchDirect("BTCUSD")}>
            <img src={Btclg} alt="BTCUSD" className='me-2' width="20"/>
            BTCUSD
          </button>

          <button className='token-btn' onClick={() => handleSearchDirect("DOGE")}>
            <img src={Dogelg} alt="DOGE" className='me-2' width="20"/>
            DOGE
          </button>

          <button className='token-btn' onClick={() => handleSearchDirect("TSLA")}>
            <img src={Tslalg} alt="TSLA" className='me-2' width="20"/>
            TSLA
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="dropdown-overlay" onClick={toggleMenu}>
        <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
        <ul>
        <li><Link to="/about">ABOUT TSLA</Link></li>
        <li><a href="#buy-shares">HOW TO BUY SHARES</a></li>
        <li><Link to="/preview">ACCOUNT UPGRADES</Link></li>
        <li><a href="#benefits">SHARE HOLDERS BENEFIT</a></li>
      </ul>
    </div>
  </div>
)}
    </div>
      {/* Auth Modal Overlay */}
      {showAuth && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ position: 'relative', background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setShowAuth(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer' }}>&times;</button>
            <SupabaseAuthForm onAuthSuccess={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Home;