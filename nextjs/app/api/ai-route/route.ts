export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Trade keywords for detection
const tradeKeywords = [
  'trade', 'buy', 'sell', 'swap', 'exchange', 'execute trade',
  'deposit', 'withdraw', 'balance', 'register', 'agent registration'
];

async function fetchBitcoinPrice() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
      headers: {
        'Accept': 'application/json',
        ...(COINGECKO_API_KEY && { 'Authorization': `Bearer ${COINGECKO_API_KEY}` }),
      },
    });
    
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }
    
    const data = await res.json();
    return data.bitcoin?.usd || 'N/A';
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    throw error;
  }
}

async function fetchTopCoins() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1',
      {
        headers: {
          'Accept': 'application/json',
          ...(COINGECKO_API_KEY && { 'Authorization': `Bearer ${COINGECKO_API_KEY}` }),
        },
      }
    );
    
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }
    
    const data = await res.json();
    return data
      .map(
        (coin: any, index: number) =>
          `${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price?.toLocaleString() || 'N/A'}`
      )
      .join('\n');
  } catch (error) {
    console.error('Error fetching top coins:', error);
    throw error;
  }
}

async function fetchTrendingMemecoins() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/search/trending',
      {
        headers: {
          'Accept': 'application/json',
          ...(COINGECKO_API_KEY && { 'Authorization': `Bearer ${COINGECKO_API_KEY}` }),
        },
      }
    );
    
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    const trendingCoins = data.coins.slice(0, 5).map((coin: any, index: number) => {
      const coinData = coin.item;
      return `${index + 1}. ${coinData.name} (${coinData.symbol.toUpperCase()}): $${coinData.price_btc?.toFixed(8) || 'N/A'} BTC - Market Cap Rank: ${coinData.market_cap_rank || 'N/A'}`;
    });
    
    return trendingCoins.join('\n');
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    throw error;
  }
}

async function fetchLatestMemecoins() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=memecoin&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h',
      {
        headers: {
          'Accept': 'application/json',
          ...(COINGECKO_API_KEY && { 'Authorization': `Bearer ${COINGECKO_API_KEY}` }),
        },
      }
    );
    
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    const memecoins = data.map((coin: any, index: number) => {
      return `${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price?.toLocaleString() || 'N/A'} - 24h Change: ${coin.price_change_percentage_24h?.toFixed(2) || 'N/A'}% - Market Cap: $${coin.market_cap?.toLocaleString() || 'N/A'}`;
    });
    
    return memecoins.join('\n');
  } catch (error) {
    console.error('Error fetching memecoins:', error);
    throw error;
  }
}

async function searchMemecoins(query: string) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
          ...(COINGECKO_API_KEY && { 'Authorization': `Bearer ${COINGECKO_API_KEY}` }),
        },
      }
    );
    
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    const results = data.coins.slice(0, 5).map((coin: any, index: number) => {
      return `${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()}) - Market Cap Rank: ${coin.market_cap_rank || 'N/A'}`;
    });
    
    return results.length > 0 ? results.join('\n') : 'No memecoins found matching your search.';
  } catch (error) {
    console.error('Error searching memecoins:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  console.log('API route called - POST /api/ai-route');
  
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { reply: 'Invalid request format. Please send valid JSON.' },
        { status: 400 }
      );
    }

    const { message } = body;
    console.log('Received message:', message);

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ reply: "Please enter a valid message." });
    }

    const lowerMsg = message.toLowerCase().trim();

    // ✅ FIXED: Only detect trade queries if message starts with /trade
    const isTradeCommand = lowerMsg.startsWith('/trade');
    
    if (isTradeCommand) {
      // Extract the actual query after /trade
      const tradeQuery = lowerMsg.replace('/trade', '').trim();
      
      // Check if the trade query contains trade-related keywords
      const isTradeRelated = tradeKeywords.some(keyword => 
        tradeQuery.includes(keyword) || tradeQuery.length === 0
      );

      if (isTradeRelated) {
        // For trade queries, provide guidance on how to use the trading functionality
        return NextResponse.json({ 
          reply: `I can help you with trading operations! Here's what I can do:

💰 **Trading Operations:**
- Execute trades between supported tokens
- Deposit ETH or tokens into your account  
- Withdraw funds from your account
- Check your balances
- Register as a user or AI agent

🔧 **How to trade:**
Simply tell me what you want to do after /trade, for example:
- "/trade I want to trade 0.1 ETH for USDC"
- "/trade deposit 1 ETH into my account"
- "/trade what's my ETH balance?"
- "/trade register me as a user"

I'll execute your trade directly on the blockchain using our smart contract.`
        });
      } else {
        // If /trade is used but the query isn't trade-related, redirect to general AI
        console.log('/trade used but query not trade-related, forwarding to AI');
        // Continue to the general AI processing below
      }
    }

    // Handle Bitcoin price queries
    if (lowerMsg.includes('bitcoin') || lowerMsg.includes('btc') || (lowerMsg.includes('price') && lowerMsg.includes('bitcoin'))) {
      try {
        const price = await fetchBitcoinPrice();
        return NextResponse.json({ 
          reply: `The current Bitcoin price is $${price} USD.` 
        });
      } catch (error) {
        console.error('Bitcoin price fetch error:', error);
        return NextResponse.json({ 
          reply: 'Sorry, I couldn\'t fetch the current Bitcoin price. Please try again later.' 
        });
      }
    }

    // Handle top coins queries
    if (lowerMsg.includes('top coins') || lowerMsg.includes('top cryptocurrencies') || lowerMsg.includes('best coins') || lowerMsg.includes('market cap')) {
      try {
        const topCoinsSummary = await fetchTopCoins();
        return NextResponse.json({ 
          reply: `Here are the top 5 cryptocurrencies by market cap:\n${topCoinsSummary}` 
        });
      } catch (error) {
        console.error('Top coins fetch error:', error);
        return NextResponse.json({ 
          reply: 'Sorry, I couldn\'t fetch the top cryptocurrencies. Please try again later.' 
        });
      }
    }

    // Handle memecoin queries
    if (lowerMsg.includes('meme') || lowerMsg.includes('memecoin') || lowerMsg.includes('dog') || lowerMsg.includes('shiba') || lowerMsg.includes('latest coin') || lowerMsg.includes('new coin')) {
      try {
        console.log('Detected memecoin query, fetching data...');
        
        if (lowerMsg.includes('trending') || lowerMsg.includes('popular')) {
          const trendingMemecoins = await fetchTrendingMemecoins();
          return NextResponse.json({ 
            reply: `Here are the currently trending memecoins:\n${trendingMemecoins}` 
          });
        }
        
        if (lowerMsg.includes('search') || lowerMsg.includes('find')) {
          const searchQuery = message.replace(/search|find|for|meme|coin/gi, '').trim();
          if (searchQuery) {
            const searchResults = await searchMemecoins(searchQuery);
            return NextResponse.json({ 
              reply: `Search results for "${searchQuery}":\n${searchResults}` 
            });
          }
        }
        
        // Default: show latest memecoins by market cap
        const latestMemecoins = await fetchLatestMemecoins();
        return NextResponse.json({ 
          reply: `Here are the top memecoins by market cap:\n${latestMemecoins}\n\nNote: Always do your own research before investing in memecoins as they are highly volatile.` 
        });
        
      } catch (error) {
        console.error('Memecoin fetch error:', error);
        return NextResponse.json({ 
          reply: 'Sorry, I couldn\'t fetch memecoin data. Please try again later.' 
        });
      }
    }

    // Forward other messages to OpenRouter (including non-trade-related /trade queries)
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key not configured');
      return NextResponse.json(
        { reply: 'Sorry, the AI service is not properly configured. Please check the server configuration.' },
        { status: 500 }
      );
    }

    console.log('Forwarding to OpenRouter API...');
    
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': `${req.nextUrl.origin}`,
        'X-Title': 'AI Trading Agent',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI trading assistant with access to real cryptocurrency data. 
            When users ask about cryptocurrency prices, trends, or specific coins, you should provide accurate, 
            up-to-date information. For memecoins specifically, mention that they are highly volatile and 
            recommend thorough research before investing. Keep responses concise and informative.
            
            If users ask about trading but don't use the /trade command, guide them to use /trade for trading operations.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    console.log('OpenRouter response status:', openrouterResponse.status);

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.error('OpenRouter API error:', openrouterResponse.status, errorText);
      
      return NextResponse.json(
        { reply: 'Sorry, the AI service is temporarily unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    const data = await openrouterResponse.json();
    console.log('OpenRouter response data:', data);
    
    const reply = data?.choices?.[0]?.message?.content;
    
    if (!reply || typeof reply !== 'string') {
      console.error('Invalid OpenRouter response format:', data);
      return NextResponse.json(
        { reply: 'Sorry, I received an invalid response from the AI service.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: reply.trim() });

  } catch (error: any) {
    console.error('Unexpected error in AI route:', error);
    return NextResponse.json(
      { reply: `Sorry, an unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}





