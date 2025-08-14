const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('../config/db');

// Serialization
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id=?', [id]);
  done(null, rows[0]);
});

/* ---------- Google Strategy ---------- */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.OAUTH_BASE_URL}/auth/google/callback`,
    },
    async (_, __, profile, done) => {
      const googleId = profile.id;
      const email = profile.emails[0].value;
      const name = profile.displayName;

      let [rows] = await db.query(
        'SELECT * FROM users WHERE provider="google" AND provider_id=?',
        [googleId]
      );

      if (!rows.length) {
        const result = await db.query(
          'INSERT INTO users (fullname,email,provider,provider_id) VALUES (?,?,?,?)',
          [name, email, 'google', googleId]
        );
        rows = [{ id: result[0].insertId, fullname: name, email }];
      }

      done(null, rows[0]);
    }
  ));
} else {
  console.log('⚠️  Google OAuth not configured - skipping Google Strategy');
}

/* ---------- Facebook Strategy ---------- */
if (process.env.FB_APP_ID && process.env.FB_APP_SECRET) {
  passport.use(new FacebookStrategy(
    {
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: `${process.env.OAUTH_BASE_URL}/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'emails'],
    },
    async (_, __, profile, done) => {
      const fbId = profile.id;
      const email = profile.emails ? profile.emails[0].value : `${fbId}@facebook.com`;
      const name = profile.displayName;

      let [rows] = await db.query(
        'SELECT * FROM users WHERE provider="facebook" AND provider_id=?',
        [fbId]
      );

      if (!rows.length) {
        const result = await db.query(
          'INSERT INTO users (fullname,email,provider,provider_id) VALUES (?,?,?,?)',
          [name, email, 'facebook', fbId]
        );
        rows = [{ id: result[0].insertId, fullname: name, email }];
      }

      done(null, rows[0]);
    }
  ));
} else {
  console.log('⚠️  Facebook OAuth not configured - skipping Facebook Strategy');
}