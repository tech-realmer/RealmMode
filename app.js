async function fetchTokenData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/exchanges');
        const exchanges = await response.json();
        const tokens = [];

        exchanges.forEach(exchange => {
            if (exchange.tickers) {
                exchange.tickers.forEach(ticker => {
                    if (ticker.market.name === 'Bybit' || ticker.market.name === 'MEXC') {
                        const existingToken = tokens.find(t => t.symbol === ticker.base);

                        if (!existingToken) {
                            tokens.push({
                                name: ticker.base,
                                symbol: ticker.base,
                                bybit: ticker.market.name === 'Bybit' ? parseFloat(ticker.last) : null,
                                mexc: ticker.market.name === 'MEXC' ? parseFloat(ticker.last) : null,
                            });
                        } else {
                            if (ticker.market.name === 'Bybit') existingToken.bybit = parseFloat(ticker.last);
                            if (ticker.market.name === 'MEXC') existingToken.mexc = parseFloat(ticker.last);
                        }
                    }
                });
            }
        });

        const filteredTokens = tokens.filter(t => t.bybit !== null && t.mexc !== null);
        const sortedTokens = filteredTokens
            .map(token => ({
                ...token,
                difference: Math.abs(token.bybit - token.mexc),
            }))
            .sort((a, b) => b.difference - a.difference)
            .slice(0, 10);

        const tableBody = document.getElementById('token-table');
        tableBody.innerHTML = sortedTokens
            .map(token => `
                <tr>
                    <td>${token.name}</td>
                    <td>${token.symbol}</td>
                    <td>${token.bybit.toFixed(2)}</td>
                    <td>${token.mexc.toFixed(2)}</td>
                    <td>${token.difference.toFixed(2)}</td>
                </tr>
            `)
            .join('');
    } catch (error) {
        console.error('Error fetching token data:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchTokenData);
