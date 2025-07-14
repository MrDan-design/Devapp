import { useEffect, useState } from "react";
import adminApi from "../../utils/adminApi";

const GiftCards = () => {
  const [giftCards, setGiftCards] = useState([]);

  useEffect(() => {
    const fetchGiftCards = async () => {
      try {
        const res = await adminApi.get("/deposits/gift-cards");
        setGiftCards(res.data);
      } catch (err) {
        console.error("Error fetching gift cards:", err);
      }
    };

    fetchGiftCards();
  }, []);

  const rejectGiftCard = async (id) => {
    try {
      const res = await adminApi.post(`/deposits/reject-gift-card/${id}`);
      alert(res.data.message);
      setGiftCards(giftCards.filter((card) => card.id !== id));
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Failed to reject gift card.");
    }
  };

  return (
    <div className="container-fluid px-4">
      <h2 className="mb-4 fw-bold text-primary">Gift Cards Awaiting Review</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Amount (USD)</th>
              <th>Card Image</th>
              <th>Uploaded At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {giftCards.map((card, index) => (
              <tr key={card.id}>
                <td>{index + 1}</td>
                <td>{card.email}</td>
                <td>${parseFloat(card.amount).toFixed(2)}</td>
                <td>
                  <a href={card.image_url} target="_blank" rel="noopener noreferrer">
                    <img src={card.image_url} alt="Gift card" width="60" height="40" />
                  </a>
                </td>
                <td>{new Date(card.created_at).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => rejectGiftCard(card.id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {giftCards.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No pending gift cards.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GiftCards;