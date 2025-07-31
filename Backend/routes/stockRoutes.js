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

// Mock data for when API key is missing
const MOCK_STOCK_DATA = [
  { symbol: 'TSLA', price: 245.67, change: 2.34, logo: LOGO_MAP.TSLA, link: 'https://finance.yahoo.com/quote/TSLA' },
  { symbol: 'NVDA', price: 891.23, change: -1.56, logo: LOGO_MAP.NVDA, link: 'https://finance.yahoo.com/quote/NVDA' },
  { symbol: 'AMD', price: 156.89, change: 3.45, logo: LOGO_MAP.AMD, link: 'https://finance.yahoo.com/quote/AMD' },
  { symbol: 'META', price: 378.90, change: 1.23, logo: LOGO_MAP.META, link: 'https://finance.yahoo.com/quote/META' },
  { symbol: 'AAPL', price: 189.45, change: -0.78, logo: LOGO_MAP.AAPL, link: 'https://finance.yahoo.com/quote/AAPL' },
];

router.get('/top', async (_req, res) => {
  try {
    // If no API key, return mock data
    if (!API_KEY) {
      console.log('⚠️ FINNHUB_KEY missing, using mock stock data');
      return res.json(MOCK_STOCK_DATA);
    }

    const quotes = await Promise.all(
      TOP_TICKS.slice(0, 5).map(sym => // Limit to 5 to avoid rate limits
        axios.get(`${FINNHUB}/quote`, { params: { symbol: sym, token: API_KEY } })
          .then(r => ({
            symbol: sym,
            price: r.data.c,
            change: r.data.dp,
            logo: LOGO_MAP[sym],
            link: `https://finance.yahoo.com/quote/${sym}`
        }))
        .catch(err => {
          console.error(`Stock API error for ${sym}:`, err.message);
          // Return mock data for this stock if API fails
          return MOCK_STOCK_DATA.find(stock => stock.symbol === sym) || {
            symbol: sym,
            price: 100.00,
            change: 0,
            logo: LOGO_MAP[sym],
            link: `https://finance.yahoo.com/quote/${sym}`
          };
        })
      )
    );
    res.json(quotes);
  } catch (err) {
    console.error('Stock route error:', err);
    // Fallback to mock data on any error
    res.json(MOCK_STOCK_DATA);
  }
});

module.exports = router;