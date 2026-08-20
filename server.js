const http = require('http');
const serveHandler = require('serve-handler');
const url = require('url');

const api_codes = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'xmr': 'monero',
  'ivvon': 'ishares-core-s-p-500-etf-ondo-tokenized-etf',
  'eemon': 'ishares-msci-emerging-markets-etf-ondo-tokenized-etf',
  'paxg': 'pax-gold',
  'sol' : 'solana',
  'bnb': 'binancecoin',
  'flip': 'chainflip',
  'lit': 'lighter',
  'thor': 'thorswap',
  'aster': 'aster-2',
  'doge': 'dogecoin',
  'ltc': 'litecoin'
};

async function fetchPrices() {
    const payload = Object.values(api_codes).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${payload}&vs_currencies=usd`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error Fetching Price: ${response.status} ${response.statusText}`);
    }

    const apiOutput = await response.json();

    const data = {};
    for (const [symbol, code] of Object.entries(api_codes)) {
        data[symbol] = apiOutput[code]?.usd || 0;
    }
    data['usdc'] = 1;

    return data;
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Handle API request
    if (pathname === '/api/prices') {
        try {
            const prices = await fetchPrices();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(prices));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    await serveHandler(req, res, {
        public: './public',
        cleanUrls: false,
        rewrites: [
            { source: '/', destination: '/index.html' }
        ]
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});