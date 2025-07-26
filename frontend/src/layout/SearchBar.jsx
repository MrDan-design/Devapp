import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SEARCH_ENTRIES = [
  { label: "Profile", path: "/profile" },
  { label: "Shares Balance", path: "/dashboard" },
  { label: "Total Invested", path: "/dashboard" },
  { label: "Crypto Deposits", path: "/deposit/crypto" },
  { label: "Wallet Funding", path: "/deposit/wallet" },
  { label: "Gift Card Deposit", path: "/deposit/gift-card" },
  { label: "Withdraw Shares", path: "/withdraw/take-out" },
  { label: "Transaction History", path: "/transactions" },
  { label: "Investment Plans", path: "/invest" },
  { label: "Portfolio Chart", path: "/portfolio" },
];

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults([]);
      setDropdownOpen(false);
      return;
    }

    const results = SEARCH_ENTRIES.filter(entry =>
      entry.label.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredResults(results);
    setDropdownOpen(true);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (path) => {
    navigate(path);
    setQuery("");
    setDropdownOpen(false);
  };

  return (
    <div className="position-relative w-100" ref={dropdownRef}>
      <input
        type="text"
        className="form-control"
        placeholder="Search pages..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {dropdownOpen && filteredResults.length > 0 && (
        <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 999, top: "100%" }}>
          {filteredResults.map((result, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelect(result.path)}
              style={{ cursor: "pointer" }}
            >
              {result.label}
            </li>
          ))}
        </ul>
      )}

      {dropdownOpen && query && filteredResults.length === 0 && (
        <div className="position-absolute bg-white border p-2 w-100 text-muted" style={{ top: "100%", zIndex: 999 }}>
          No results found
        </div>
      )}
    </div>
  );
};

export default SearchBar;
