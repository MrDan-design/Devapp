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
  const { data } = await axios.get(SUPABASE_JWKS_URL);
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
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    // Decode header to get kid
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header.kid) {
      return res.status(401).json({ message: 'Invalid token header' });
    }
    const jwks = await getSupabaseJWKs();
    const jwk = getKeyFromJWKs(decodedHeader.header.kid, jwks);
    if (!jwk) {
      return res.status(401).json({ message: 'Public key not found for token' });
    }
    const pem = jwkToPem(jwk);
    const decoded = jwt.verify(token, pem, { algorithms: ['RS256'] });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};

//console.log("Token received:", token);
//console.log("Decoded:", jwt.decode(token));

module.exports = verifyToken;