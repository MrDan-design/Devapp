const jwt = require('jsonwebtoken');
const axios = require('axios');
const SUPABASE_JWKS_URL = `https://rcvyqtekidnrkhlbygam.supabase.co/auth/v1/keys`;

let jwksCache = null;
let jwksCacheTime = 0;
const JWKS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getSupabaseJWKs() {
  const now = Date.now();
  if (jwksCache && (now - jwksCacheTime < JWKS_CACHE_TTL)) {
    return jwksCache;
  }
  const { data } = await axios.get(SUPABASE_JWKS_URL, {
    headers: {
      apikey: process.env.SUPABASE_KEY
    }
  });
  jwksCache = data.keys;
  jwksCacheTime = now;
  return jwksCache;
}

function getKeyFromJWKs(kid, jwks) {
  return jwks.find(key => key.kid === kid);
}

function jwkToPem(jwk) {
  // Only supports RSA keys
  const { n, e } = jwk;
  const pubKey = {
    kty: 'RSA',
    n: Buffer.from(n, 'base64'),
    e: Buffer.from(e, 'base64'),
  };
  // Use a library for full conversion, but for most Node.js JWT libs, you can use the jwk-to-pem package
  const jwkToPemLib = require('jwk-to-pem');
  return jwkToPemLib(jwk);
}

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  console.log('Received token:', token);
  try {
    // Decode header to get kid
    const decodedHeader = jwt.decode(token, { complete: true });
    console.log('Decoded JWT header:', decodedHeader);
    if (!decodedHeader || !decodedHeader.header.kid) {
      console.log('Invalid token header');
      return res.status(401).json({ message: 'Invalid token header' });
    }
    const jwks = await getSupabaseJWKs();
    const jwk = getKeyFromJWKs(decodedHeader.header.kid, jwks);
    if (!jwk) {
      console.log('Public key not found for token');
      return res.status(401).json({ message: 'Public key not found for token' });
    }
    const pem = jwkToPem(jwk);
    const decoded = jwt.verify(token, pem, { algorithms: ['RS256'] });
    console.log('Decoded JWT payload:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('JWT verification error:', err);
    return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};

//console.log("Token received:", token);
//console.log("Decoded:", jwt.decode(token));

module.exports = verifyToken;