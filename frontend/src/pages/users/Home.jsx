
import { Link } from 'react-router-dom';
import BackendAuthForm from '../../components/BackendAuthForm';
import "./Home.css";
import FadeIn from '../../components/FadeIn';
import PageWrapper from '../../components/PageWrapper';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import lgNow from '../../assets/lg-now.png';
import Btclg from '../../assets/Bitcoin-Logo.png'
import Dogelg from '../../assets/Doge-logo.png'
import Tslalg from '../../assets/Tesla-Logo.png'

const Home = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleShowLogin = () => {
    setAuthMode('login');
    setShowAuth(true);
  };

  const handleShowSignup = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  // Manage body scroll when modal is open
  useEffect(() => {
    if (showAuth) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };
  }, [showAuth]);

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
      <nav className="navbar">
        <div className="d-flex align-items-center">
          <button className="btn btn-outline-light me-2" onClick={toggleMenu} style={{
            zIndex: 300, position: 'relative'
          }}>☰</button>
          <span className="navbar-brand">
            <img src={lgNow} alt="Logo" />
          </span>
        </div>

        <div className="d-flex align-items-center">
          <button className="btn btn-outline-light me-2" onClick={handleShowLogin}>Login</button>
          <button className="btn btn-primary custom-button" onClick={handleShowSignup}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h1>
          Encompassing The <br /> Modern World Shares
        </h1>

        {/* Search Bar */}
        <div className="input-group">
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
      {/* Auth Modal Overlay - Mobile Optimized */}
      {showAuth && (
        <div className="auth-modal-backdrop">
          <div className="auth-modal-container">
            <button 
              onClick={() => setShowAuth(false)} 
              className="auth-modal-close"
              aria-label="Close"
            >
              &times;
            </button>
            <div className="auth-modal-content">
              <BackendAuthForm 
                initialMode={authMode}
                onAuthSuccess={() => {
                  setShowAuth(false);
                  navigate('/dashboard');
                }} 
              />
            </div>
          </div>
          
          <style>{`
            .auth-modal-backdrop {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background-image: linear-gradient(
                  rgba(0, 0, 0, 0.6),
                  rgba(0, 0, 0, 0.6)
                ),
                url("../../assets/bg-image.jpg");
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              backdrop-filter: blur(15px);
              -webkit-backdrop-filter: blur(15px);
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: fadeIn 0.3s ease;
              padding: 0;
              overflow-y: auto;
              -webkit-overflow-scrolling: touch;
            }
            
            .auth-modal-container {
              position: relative;
              width: 100%;
              max-width: 500px;
              margin: 20px auto;
              animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              display: flex;
              flex-direction: column;
              min-height: 0;
              max-height: calc(100vh - 40px);
              padding: 0 20px;
            }
            
            .auth-modal-close {
              position: absolute;
              top: -10px;
              right: 10px;
              background: rgba(255, 255, 255, 0.25);
              border: none;
              color: white;
              font-size: 28px;
              font-weight: 300;
              cursor: pointer;
              z-index: 10001;
              border-radius: 50%;
              width: 44px;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              line-height: 1;
            }
            
            .auth-modal-close:hover {
              background: rgba(255, 255, 255, 0.35);
              transform: scale(1.05);
            }
            
            .auth-modal-close:active {
              transform: scale(0.95);
            }
            
            .auth-modal-content {
              flex: 1;
              overflow-y: auto;
              -webkit-overflow-scrolling: touch;
              padding-top: 20px;
            }
            
            @keyframes fadeIn {
              0% { 
                opacity: 0;
                backdrop-filter: blur(0px);
                -webkit-backdrop-filter: blur(0px);
              }
              100% { 
                opacity: 1;
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
              }
            }
            
            @keyframes slideUp {
              0% { 
                opacity: 0; 
                transform: translateY(60px) scale(0.95);
              }
              100% { 
                opacity: 1; 
                transform: translateY(0) scale(1);
              }
            }
            
            /* Mobile Optimizations */
            @media (max-width: 768px) {
              .auth-modal-backdrop {
                align-items: flex-start;
                padding: 0;
              }
              
              .auth-modal-container {
                max-width: 100%;
                margin: 0;
                padding: 10px;
                min-height: 100vh;
                max-height: 100vh;
                justify-content: flex-start;
                padding-top: 60px;
              }
              
              .auth-modal-close {
                top: 15px;
                right: 15px;
                width: 48px;
                height: 48px;
                font-size: 30px;
              }
              
              .auth-modal-content {
                padding-top: 0;
                padding-bottom: 40px;
              }
            }
            
            @media (max-width: 480px) {
              .auth-modal-container {
                padding: 5px;
                padding-top: 70px;
              }
              
              .auth-modal-close {
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                font-size: 32px;
              }
            }
            
            /* Prevent body scroll when modal is open */
            body.modal-open {
              overflow: hidden;
              position: fixed;
              width: 100%;
              height: 100%;
            }
          `}</style>
        </div>
      )}
    </PageWrapper>
  );
};

export default Home;