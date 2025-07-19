const express = require('express');
const axios = require('axios');
const router = express.Router();

const FINNHUB = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_KEY;
const TOP_TICKS = ['TSLA','NVDA','AMD','META','AAPL','MSFT','GOOG','NFLX','BABA','INTC'];
const LOGO_MAP = {
  TSLA: "https://logo.clearbit.com/tesla.com",
  NVDA: "https://logo.clearbit.com/nvidia.com",
  AMD: "https://logo.clearbit.com/amd.com",
  META: "https://logo.clearbit.com/meta.com",
  AAPL: "https://logo.clearbit.com/apple.com",
  MSFT: "https://logo.clearbit.com/microsoft.com",
  GOOG: "https://logo.clearbit.com/google.com",
  NFLX: "https://logo.clearbit.com/netflix.com",
  BABA: "https://logo.clearbit.com/alibaba.com",
  INTC: "https://logo.clearbit.com/intel.com"
};

router.get('/top', async (_req, res) => {
  try {
    const quotes = await Promise.all(
      TOP_TICKS.map(sym =>
        axios.get(`${FINNHUB}/quote`, { params: { symbol: sym, token: API_KEY } })
          .then(r => ({
            symbol: sym,
            price: r.data.c,
            change: r.data.dp,
            logo: LOGO_MAP[sym],
            link: `https://finance.yahoo.com/quote/${sym}`
        }))
      )
    );
    res.json(quotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Stock feed error' });
  }
});

module.exports = router;