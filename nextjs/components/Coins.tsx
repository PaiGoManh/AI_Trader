import React, { useEffect, useState, useRef, useCallback } from 'react';

const PER_PAGE = 10;

interface Coin {
  id: string;
  image: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
}

function Loader() {
  return (
    <div className="flex justify-center items-center w-full py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-400"></div>
    </div>
  );
}

export default function Coins() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastCoinElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
        const headers: HeadersInit = {};
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${PER_PAGE}&page=${page}&sparkline=false`,
          { headers }
        );
        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }
        const data: Coin[] = await res.json();
        setCoins(prev => [...prev, ...data]);
        setHasMore(data.length === PER_PAGE);
      } catch (error) {
        console.error('Failed to fetch coins:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoins();
  }, [page]);

  return (
    <div className="min-h-screen bg-[#0b0d12]">
      <div className="max-w-5xl mx-auto bg-[#0b0d12] shadow-2xl ring-1 ring-gray-700 p-6">
        <h1 className="text-3xl text-white font-semibold mb-6 text-center tracking-wide">Cryptocurrency Coins</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg overflow-hidden shadow">
            <thead>
              <tr className="bg-[#0b0d12] border border-grey-800 text-gray-300 uppercase text-xs leading-normal">
                <th className="py-3 px-4 text-left">Image</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Symbol</th>
                <th className="py-3 px-4 text-right">Price (USD)</th>
                <th className="py-3 px-4 text-right">Market Cap</th>
                <th className="py-3 px-4 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {coins.length === 0 && loading ? (
                <tr>
                  <td colSpan={6}>
                    <Loader />
                  </td>
                </tr>
              ) : (
                coins.map((coin, idx) =>
                  coins.length === idx + 1 ? (
                    <tr
                      ref={lastCoinElementRef}
                      key={coin.id}
                      className="border-b border-gray-700 hover:bg-gray-900 transition"
                    >
                      <td className="py-3 px-4">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{coin.name}</td>
                      <td className="py-3 px-4 text-gray-400 uppercase">{coin.symbol}</td>
                      <td className="py-3 px-4 text-right text-blue-200 font-semibold">
                        ${coin.current_price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-green-300 font-medium">
                        ${coin.market_cap.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-yellow-300 font-medium">
                        ${coin.total_volume.toLocaleString()}
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={coin.id}
                      className="border-b border-gray-700 hover:bg-gray-900 transition"
                    >
                      <td className="py-3 px-4">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{coin.name}</td>
                      <td className="py-3 px-4 text-gray-400 uppercase">{coin.symbol}</td>
                      <td className="py-3 px-4 text-right text-blue-200 font-semibold">
                        ${coin.current_price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-green-300 font-medium">
                        ${coin.market_cap.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-yellow-300 font-medium">
                        ${coin.total_volume.toLocaleString()}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
          {loading && coins.length > 0 && <Loader />}
        </div>
      </div>
    </div>
  );
}
