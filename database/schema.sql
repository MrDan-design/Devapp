CREATE DATABASE IF NOT EXISTS devapp;

USE devapp;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_symbol VARCHAR(10) NOT NULL,
  shares_owned DECIMAL(10, 4) NOT NULL,
  total_invested_usd DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO wallet_addresses (crypto_type, address) VALUES
('Bitcoin', 'bc1q7a2atsnahug8q5cg8qpyl7n3c8f3u6acykthxh
'),
('Ethereum', '0x45fee03b9eF634A773370201b3D72bF2C2C30b9B'
),
('Doge', 'DBzZBv3nDadiC7oyxoW8PQDPs1UbL68irs
'),
('Solana', 'dUbNVjuNMFnmFFd9ZzMdDUQJQ9RagXG7BRPAmS9KF2q
'),
('Polygon', '0x45fee03b9eF634A773370201b3D72bF2C2C30b9B');