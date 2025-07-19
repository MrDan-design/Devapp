import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';
import elonImage from '../../assets/elon.webp';
import team1 from '../../assets/team1.jpg';
import team2 from '../../assets/team2.jpg';
import product1a from '../../assets/product1.jpg';
import product1b from '../../assets/product2.jpg';
import product2a from '../../assets/grok.webp';
import product2b from '../../assets/cybertruck.jpg';

const About = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState(0); // 0: About Us, 1: Meet the Team, 2: Our Products 1, 3: Our Products 2

  const handleNext = () => {
    if (section < 3) setSection(section + 1);
  };

  const handleBack = () => {
    if (section > 0) setSection(section - 1);
  };

  return (
    <div className="about-page">
      <div className="background-blur"></div>

      {/* Top Nav */}
      <div className="top-nav d-flex position-fixed w-100 bg-white px-5 align-items-center justify-content-between">
        <img src="/rf-lg.png" alt="Logo" style={{ height: "30px"}}/>
        <button className="close-btn fw-bold fs-3 border-0 bg-transparent" onClick={() => navigate('/')}>×</button>
      </div>

      {/* Main Content */}
      <div className="about-content container-fluid d-flex flex-column justify-content-center align-items-center">
        {section === 0 && (
          <>
            <h2 className="text-white mb-0 fw-bold">About Us</h2>
            <div className="about-flex d-flex flex-column flex-md-row align-items-center justify-content-center">
              <div className="image-container me-md-4 mb-4 mb-md-0">
                <img src={elonImage} alt="Elon Musk" className="elon-img" />
              </div>
              <div className="text-white about-text-box position-relative">
                <p className="about-text">
                  Tesla, Inc. is an American electric vehicle (EV) and clean energy company founded in 2003 by Martin Eberhard and Marc Tarpenning, later joined by Elon Musk. Known for revolutionizing the automotive industry, Tesla designs and manufactures electric cars, battery energy storage systems, and solar products.
                  <br /><br />
                  With groundbreaking models like the Model S, Model 3, Model X, and Model Y, Tesla has pushed the boundaries of performance, range, and autonomous driving technology. Beyond vehicles, Tesla’s energy division focuses on renewable solutions like Powerwall, Powerpack, and Solar Roof, aiming to accelerate the world’s transition to sustainable energy.
                  <br /><br />
                  Headquartered in Palo Alto, California, Tesla continues to lead innovation in the EV market while challenging conventional automotive and energy industries worldwide.
                </p>
                <button className="btn btn-light position-absolute next-btn" onClick={handleNext}>›</button>
              </div>
            </div>
          </>
        )}

        {section === 1 && (
          <>
            <h2 className="text-white mb-4 fw-bold">Meet the Team</h2>
            <div className="d-flex flex-column flex-md-row justify-content-center gap-4 mb-4">
              <img src={team1} alt="Team Member 1" className="team-img" />
              <img src={team2} alt="Team Member 2" className="team-img" />
            </div>
            <div className="text-white about-text-box position-relative">
              <p className="about-text text-center">
                Behind every great achievement is a team of passionate individuals driven by a shared vision. At [Company Name], our team blends creativity, expertise, and innovation to deliver exceptional results. From designers and developers to strategists and project managers, each member brings unique skills and a commitment to excellence. Together, we make ideas happen — and we’re excited to bring your vision to life.
              </p>
              <button className="btn btn-light position-absolute back-btn" onClick={handleBack}>‹</button>
              <button className="btn btn-light position-absolute next-btn" onClick={handleNext}>›</button>
            </div>
          </>
        )}

        {section === 2 && (
  <>
    <h2 className="text-white mb-4 fw-bold">Our Products</h2>
    <div className="d-flex flex-column gap-5">
      <div className="d-flex flex-column back flex-md-row align-items-start justify-content-start gap-5">
        <img src={product1a} alt="Product 1A" className="product-img mb-1 mb-md-0" />
        <div className="text-white">
          <h5>Our Electric Cars</h5>
          <p className="about-text">
            Tesla’s electric vehicles redefine performance, safety, and innovation in the automotive world. Designed with cutting-edge battery technology, sleek aerodynamics, and advanced software, each Tesla delivers an unmatched driving experience. From the high-performance Model S and versatile Model X, to the affordable Model 3 and compact Model Y, Tesla’s lineup offers something for every driver. With zero emissions, long-range capability, and features like Autopilot, Tesla’s cars aren’t just vehicles — they’re a glimpse into the future of mobility.
          </p>
        </div>
      </div>

      <div className="d-flex flex-column back flex-md-row align-items-start justify-content-start gap-5">
        <img src={product1b} alt="Product 1B" className="product-img mb-1 mb-md-0" />
        <div className="text-white">
          <h5>Starlink</h5>
          <p className="about-text">
            Starlink, a project by SpaceX, is a satellite-based internet service designed to deliver high-speed broadband access across the globe. Using a growing network of low Earth orbit (LEO) satellites, Starlink provides reliable internet connectivity, especially in remote and underserved areas where traditional networks fall short. With its mission to bridge the digital divide, Starlink offers fast download speeds, low latency, and the potential to revolutionize global communication. Whether for homes, businesses, or mobile users, Starlink is redefining how the world connects.
          </p>
        </div>
      </div>
    </div>

    <div className="d-flex justify-content-between w-100 mt-4 px-3">
      <button className="btn btn-light" onClick={handleBack}>‹</button>
      <button className="btn btn-light" onClick={handleNext}>›</button>
    </div>
  </>
)}

{section === 3 && (
  <>
    <h2 className="text-white mb-4 fw-bold">Our Products</h2>
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-column back flex-md-row align-items-start justify-content-start gap-3">
        <img src={product2a} alt="Product 2A" className="product-img mb-3 mb-md-0" />
        <div className="text-white">
          <h5>Grok</h5>
          <p className="about-text">
            Grok is an AI chatbot developed by xAI, Elon Musk’s artificial intelligence company. Designed as a conversational assistant, Grok integrates advanced language models to provide real-time answers, creative insights, and personalized interactions. Unlike typical AI tools, Grok is built with a sense of humor and a bold personality, aiming to make information-seeking more engaging and human-like. With direct integration into platforms like X (formerly Twitter), Grok represents a fresh approach to AI-powered communication — smart, witty, and always learning.
          </p>
        </div>
      </div>

      <div className="d-flex flex-column back flex-md-row align-items-start justify-content-start gap-4">
        <img src={product2b} alt="Product 2B" className="product-img mb-3 mb-md-0" />
        <div className="text-white">
          <h5>Cybertruck</h5>
          <p className="about-text">
            The Tesla Cybertruck is a revolutionary all-electric pickup designed to challenge conventional automotive design and performance. Built with ultra-hard stainless steel exoskeleton and armored glass, the Cybertruck combines durability with futuristic aesthetics. Engineered for strength, utility, and speed, it offers impressive towing capacity, adaptive air suspension, and powerful electric drivetrain options. More than just a truck, the Cybertruck redefines what a utility vehicle can be — rugged, high-performing, and sustainable, all while making a bold statement on and off the road.
          </p>
        </div>
      </div>
    </div>

    <div className="d-flex justify-content-start w-100 mt-4 px-3">
      <button className="btn btn-light" onClick={handleBack}>‹</button>
    </div>
  </>
)}

      </div>
    </div>
  );
};

export default About;
