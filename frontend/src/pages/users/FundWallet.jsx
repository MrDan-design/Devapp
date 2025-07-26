import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';

const FundWallet = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tabParam = params.get("tab");
  const [takeoutAmount, setTakeoutAmount] = useState('');
  const [cryptoTypeTakeout, setCryptoTypeTakeout] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const handleTakeoutSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/withdrawals/take-out`, {
      amount_usd: takeoutAmount,
      crypto_symbol: cryptoTypeTakeout.toLowerCase(),
      wallet_address: walletAddress,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    alert(`✅ Withdrawal request sent!\nYou'll receive ≈ ${res.data.crypto_amount} ${cryptoTypeTakeout.toUpperCase()}`);
    
    // Reset fields
    setTakeoutAmount('');
    setCryptoTypeTakeout('');
    setWalletAddress('');
  } catch (err) {
    console.error(err);
    alert("❌ Withdrawal failed. Please try again.");
  }
};

  const [activeTab, setActiveTab] = useState(tabParam || 'fund');
  const [method, setMethod] = useState('crypto');
  const [wallets, setWallets] = useState([]);
  const [cryptoType, setCryptoType] = useState('');
  const [txHash, setTxHash] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [cardCountry, setCardCountry] = useState('');
  const [cardType, setCardType] = useState('');
  const [cardFrontImage, setCardFrontImage] = useState(null);
  const [cardBackImage, setCardBackImage] = useState(null);

  useEffect(() => {
    if (method === 'crypto') {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/deposit/wallets`)
        .then(res => setWallets(res.data))
        .catch(err => console.error(err));
    }
  }, [method]);

  const handleCryptoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/deposit/crypto`, {
        crypto_type: cryptoType,
        tx_hash: txHash,
        amount_usd: amountUsd
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert(res.data.message);
      setCryptoType('');
      setTxHash('');
      setAmountUsd('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit crypto deposit.');
    }
  };

  const handleGiftCardSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('card_country', cardCountry);
    formData.append('card_type', cardType);
    formData.append('card_value', cardAmount);
    formData.append('card_front_image', cardFrontImage);
    formData.append('card_back_image', cardBackImage);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/deposit/gift-cards`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(res.data.message || 'Giftcard submitted!');
      setCardAmount('');
      setCardType('');
      setCardCountry('');
      setCardFrontImage(null);
      setCardBackImage(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit giftcard.');
    }
  };

  return (
    <PageWrapper>
      <div>
      {/* Tabs */}
      <div className="d-flex mb-4 gap-3 flex-wrap">
        <button className={`btn ${activeTab === 'fund' ? 'btn-danger' : 'btn-outline-dark'}`} onClick={() => setActiveTab('fund')}>
          Fund Wallet
        </button>
        <button className={`btn ${activeTab === 'swap' ? 'btn-danger' : 'btn-outline-dark'}`} onClick={() => setActiveTab('swap')}>
          Swap
        </button>
        <button className={`btn ${activeTab === 'takeout' ? 'btn-danger' : 'btn-outline-dark'}`} onClick={() => setActiveTab('takeout')}>
          Take Out Shares
        </button>
      </div>

      {/* FUND WALLET */}
      {activeTab === 'fund' && (
        <div>
          <div className="mb-3">
            <label>Select Method:</label>
            <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="crypto">Crypto</option>
              <option value="giftcard">Gift Card</option>
              <option disabled>Credit Card (Coming Soon)</option>
              <option disabled>Bank Transfer (Coming Soon)</option>
            </select>
          </div>

          {/* CRYPTO METHOD */}
          {method === 'crypto' && (
  <>
    <div className="mb-3">
      <label>Select Wallet Address</label>
      <div className="input-group">
        <select
          className="form-select"
          onChange={(e) => setWalletAddress(e.target.value)}
          value={walletAddress}
          required
        >
          <option value="">-- Select Wallet --</option>
          {wallets.map((wallet, idx) => (
            <option key={idx} value={wallet.address}>
              {wallet.crypto_type} - {wallet.address.slice(0, 12)}...
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => {
            if (walletAddress) {
              navigator.clipboard.writeText(walletAddress);
              alert("Wallet address copied!");
            }
          }}
        >
          📋
        </button>
      </div>
    </div>

    <form onSubmit={handleCryptoSubmit}>
      <div className="mb-3">
        <label>Crypto Type</label>
        <input
          type="text"
          className="form-control"
          value={cryptoType}
          onChange={(e) => setCryptoType(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Transaction Hash (Tx Hash)</label>
        <input
          type="text"
          className="form-control"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Amount in USD</label>
        <input
          type="number"
          className="form-control"
          value={amountUsd}
          onChange={(e) => setAmountUsd(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-success">Submit Crypto Deposit</button>
    </form>
  </>
)}

          {/* GIFTCARD METHOD */}
          {method === 'giftcard' && (
            <form onSubmit={handleGiftCardSubmit}>
              <div className="mb-3">
                <label>Card Country</label>
                <input type="text" className="form-control" value={cardCountry} onChange={(e) => setCardCountry(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label>Card Type</label>
                <select className="form-select" value={cardType} onChange={(e) => setCardType(e.target.value)} required>
                  <option value="">Select Type</option>
                  <option value="iTunes">iTunes</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Steam">Steam</option>
                  <option value="Google Play">Google Play</option>
                </select>
              </div>
              <div className="mb-3">
                <label>Card Value (USD)</label>
                <input type="number" className="form-control" value={cardAmount} onChange={(e) => setCardAmount(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label>Front Image</label>
                <input type="file" className="form-control" onChange={(e) => setCardFrontImage(e.target.files[0])} required />
              </div>
              <div className="mb-3">
                <label>Back Image</label>
                <input type="file" className="form-control" onChange={(e) => setCardBackImage(e.target.files[0])} required />
              </div>
              <button type="submit" className="btn btn-success">Submit Gift Card</button>
            </form>
          )}
        </div>
      )}

      {/* SWAP */}
      {activeTab === 'swap' && (
        <div><h5>Swap Section Coming Soon</h5></div>
      )}

      {/* TAKEOUT */}
      {activeTab === 'takeout' && (
  <div className="bg-white p-4 rounded">
    <h5 className="mb-4">Take Out Shares</h5>
    <form onSubmit={handleTakeoutSubmit}>
      <div className="mb-3">
        <label>Amount in USD</label>
        <input
          type="number"
          className="form-control"
          value={takeoutAmount}
          onChange={(e) => setTakeoutAmount(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Crypto Type</label>
        <input
          type="text"
          className="form-control"
          value={cryptoTypeTakeout}
          onChange={(e) => setCryptoTypeTakeout(e.target.value)}
          placeholder="e.g. BTC, USDT, ETH"
          required
        />
      </div>
      <div className="mb-3">
        <label>Wallet Address</label>
        <input
          type="text"
          className="form-control"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-danger">Request Withdrawal</button>
    </form>
  </div>
)}
    </div>
    </PageWrapper>
  );
};

export default FundWallet;