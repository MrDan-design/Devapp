-- MySQL Schema for devapp databasINSERT INTO wallet_addresses (crypto_type, address) VALUES
('Bitcoin', 'bc1q7a2atsnahug8q5cg8qpyl7n3c8f3u6acykthxh'),
('Ethereum', '0x45fee03b9eF634A773370201b3D72bF2C2C30b9B'),
('Doge', 'DBzZBv3nDadiC7oyxoW8PQDPs1UbL68irs'),
('Solana', 'dUbNVjuNMFnmFFd9ZzMdDUQJQ9RagXG7BRPAmS9KF2q'),
('Polygon', '0x45fee03b9eF634A773370201b3D72bF2C2C30b9B');

-- Chat system tables
CREATE TABLE IF NOT EXISTS chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_chat (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);This file should be executed after connecting to the devapp database

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    next_of_kin VARCHAR(100),
    next_of_kin_number VARCHAR(20),
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

CREATE TABLE IF NOT EXISTS wallet_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crypto_type VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO wallet_addresses (crypto_type, address) VALUES
('Bitcoin', 'bc1q7a2atsnahug8q5cg8qpyl7n3c8f3u6acykthxh'),
('Ethereum', '0x45fee03b9eF634A773370201b3D72bF2C2C30b9B'),
('Doge', 'DBzZBv3nDadiC7oyxoW8PQDPs1UbL68irs'),
('Solana', 'dUbNVjuNMFnmFFd9ZzMdDUQJQ9RagXG7BRPAmS9KF2q'),
('Polygon', '0x45fee03b9eF634A773370201b3D72bF2C2C30b9B');