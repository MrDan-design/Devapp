import { useEffect, useState } from "react";
import adminApi from "../../utils/adminApi";

const GiftCards = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGiftCards = async () => {
    try {
      const res = await adminApi.get("/deposits/gift-cards");
      setGiftCards(res.data);
    } catch (err) {
      console.error("Error fetching gift cards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.post(`/deposits/gift-cards/reject/${id}`);
      setGiftCards((prev) => prev.filter((card) => card.id !== id));
    } catch (err) {
      console.error("Failed to reject gift card:", err);
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, []);

  if (loading) return <div className="p-4">Loading gift cards...</div>;
  if (giftCards.length === 0) return <div className="p-4 text-gray-600">No gift cards found.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Gift Card Submissions</h2>
      <div className="grid gap-4">
        {giftCards.map((card) => (
          <div key={card.id} className="bg-white p-4 rounded shadow-md">
            <p><strong>User:</strong> {card.user_id}</p>
            <p><strong>Country:</strong> {card.country}</p>
            <p><strong>Value:</strong> ${card.value}</p>
            <p><strong>Status:</strong> {card.status}</p>
            <div className="flex gap-2 mt-2">
              <img src={card.front_image_url} alt="Front" className="w-40 h-auto rounded border" />
              <img src={card.back_image_url} alt="Back" className="w-40 h-auto rounded border" />
            </div>
            <button
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => handleReject(card.id)}
            >
              Reject
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GiftCards;