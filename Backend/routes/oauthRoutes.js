const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

/* ----- Google ----- */
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        is_admin: req.user.is_admin
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

/* ----- Facebook ----- */
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        is_admin: req.user.is_admin
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

module.exports = router;