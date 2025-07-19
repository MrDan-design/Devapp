import { useEffect, useState } from "react";
import axios from "axios";
import PageWrapper from "../../components/PageWrapper";

const Invest = () => {
  const [packages, setPackages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/invest/categories", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPackages(res.data);
      } catch (err) {
        console.error("Error fetching investment categories:", err);
      }
    };
    fetchPackages();
  }, []);

  const handleInvest = async (categoryId) => {
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/invest",
        { category_id: categoryId, amount, duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "Investment created!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Investment failed.");
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % packages.length);
    setSelected(null);
    setMessage("");
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
    setSelected(null);
    setMessage("");
  };

  const pkg = packages[currentIndex];

  return (
    <PageWrapper>
      <div className="container py-4">
        <h3 className="fw-bold mb-4 text-danger">Tesla Investment Plans</h3>

        {pkg && (
  <div
    key={pkg.id}
    className={`bg-white rounded-4 p-4 mb-4 d-flex flex-column flex-md-row align-items-start gap-4 animate-slide`}
    style={{ animation: 'slideIn 0.5s ease-in-out' }}
  >
    {/* Image */}
    <img
      src={`/investments/${pkg.id}.jpg`}
      alt={pkg.name}
      className="rounded"
      style={{ width: "50%", objectFit: 'cover', height: '450px' }}
    />

    {/* Info */}
    <div className="flex-grow-1">
      <h5 className="fw-semibold">{pkg.name}</h5>
      <p className="text-muted mb-1">Minimum: ${pkg.min_amount}</p>
      <p className="text-muted mb-1">Shares: {pkg.min_shares}</p>

      {/* Neatly stacked durations */}
      <div className="text-muted mb-2">
        <div className="d-flex justify-content-between">
          <span>5 Days:</span> <span>{pkg.roi_5days}%</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>1 Month:</span> <span>{pkg.roi_1month}%</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>3 Months:</span> <span>{pkg.roi_3months}%</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Annual:</span> <span>{pkg.roi_annual}%</span>
        </div>
      </div>

      {selected === pkg.id ? (
        <>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <input
                type="number"
                placeholder="Amount to invest"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="">Select Duration</option>
                <option value="5days">5 Days</option>
                <option value="1month">1 Month</option>
                <option value="3months">3 Months</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>
          <button
            className="btn btn-danger rounded-pill px-4"
            onClick={() => handleInvest(pkg.id)}
            disabled={loading}
          >
            {loading ? "Processing..." : "Create Investment"}
          </button>

          {message && (
            <p className={`mt-2 fw-medium ${message.includes("failed") ? "text-danger" : "text-success"}`}>
              {message}
            </p>
          )}
        </>
      ) : (
        <button
          className="btn btn-outline-danger rounded-pill px-4 mt-2"
          onClick={() => {
            setSelected(pkg.id);
            setAmount("");
            setDuration("");
            setMessage("");
          }}
        >
          Select Plan
        </button>
      )}
    </div>
  </div>
)}



        {/* Pagination Dots + Navigation */}
<div className="d-flex flex-column align-items-center gap-3 mt-3">
  {/* Pagination Dots */}
  <div className="d-flex gap-2">
    {packages.map((_, i) => (
      <div
        key={i}
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: currentIndex === i ? "#6425FE" : "#ccc",
          transition: "background-color 0.3s ease"
        }}
      />
    ))}
  </div>

  {/* Prev/Next Buttons */}
  <div className="d-flex justify-content-between w-100" style={{ maxWidth: 300 }}>
    <button
      className="btn btn-outline-secondary rounded-pill w-100 me-2"
      onClick={goPrevious}
      disabled={currentIndex === 0}
    >
      ← Previous
    </button>

    <button
      className="btn btn-outline-secondary rounded-pill w-100"
      onClick={goNext}
      disabled={currentIndex === packages.length - 1}
    >
      Next →
    </button>
  </div>
</div>
      </div>
    </PageWrapper>
  );
};

export default Invest;
