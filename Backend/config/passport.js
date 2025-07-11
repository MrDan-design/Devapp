const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('../config/db');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const [rows] = await db.query('SELECT * FROM users WHER id=?', [id]);
    done(null, rows[0]);
});

/* ---------- Google Strategy ---------- */
passport.use(new GoogleStrategy (
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.OAUTH_BASE_URL}/auth/google/callback`
    },
    async (_, __, Profiler, done) => {
        const googleId = Profiler.id;
        const email = Profiler.emails[0].value;
        const name = Profiler.displayName;

        //find or create
        let [rows] = await db.query('SELECT * FROM users WHERE provider="google" AND provider_id=?', [googleId]);
        if (!rows.length) {
            const result = await db.query(
                `INSERT INTO users (fullname,email,provider,provider_id) VALUES (?,?,?,?)`,
                [name, email, 'google', googleId]
            );
            rows = [{ id:result[0].insertId, fullname: name, email}];
        }
        done(null, rows[0]);
    }
));

/* ---------- Facebook Strategy ---------- */
passport.use(new FacebookStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    callbackURL: `${process.env.OAUTH_BASE_URL}/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'emails']
},
async (_, __, profile, done) => {
    const fbId = profile.id;
    const email = profile.emails ? profile.emails[0].value : `${fbId}@facebook.com`;
    const name = profile.displayName;

    let [rows] = await db.query('SELECT * FROM users WHERE provider="facebook" AND provider_id=?', [fbId]);
    if (!rows.length) {
        const result = await db.query(
            `INSERT INTO users (fullname,email,provider,provider_id) VALUES (?,?,?,?)`,
            [name, email, 'facebook', fbId]
        );
        rows = [{ id: result[0].insertId, fullname: name, email}];
    }
    done(null, rows[0]);
}
))