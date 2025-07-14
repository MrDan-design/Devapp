const express = require('express');
const axios = require('axios');
const router = express.Router();

const FINNHUB = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_KEY;
const TOP_TICKS = ['TSLA','NVDA','AMD','META','AAPL','MSFT','GOOG','NFLX','BABA','INTC'];


router.get('/top', async (_req, res) => {
    try {
        const quotes = await Promise.all(
            TOP_TICKS.map(sym =>
                axios.get(`${FINNHUB}/quote`, {params:{symbol:sym, token:API_KEY }})
                .then(r => ({
                    symbol: sym,
                    price: r.data.c,
                    change: r.data.dp,
                    link: `https://finance.yahoo.com/quote/${sym}`
                }))
            )
        );
        res.json(quotes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Stock feed error'})
    }
});

module.exports = router;