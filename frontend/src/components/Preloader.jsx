// src/components/Preloader.jsx
import { useEffect, useState } from "react";
import "./Preloader.css";

const Preloader = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 5000); // show for 3 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="preloader-container">
      <h1 className="wave-text">
        {["T", "E", "S", "L", "A"].map((letter, idx) => (
          <span key={idx} style={{ animationDelay: `${idx * 0.2}s` }}>
            {letter}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default Preloader;