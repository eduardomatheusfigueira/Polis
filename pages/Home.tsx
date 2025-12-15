import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews, getRankings } from '../services/dataService';
import { NewsItem, RankingItem } from '../types';
import Button from '../components/Button';
import { Icons } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);

  useEffect(() => {
    // Load mock data
    setNews(getNews());
    setRankings(getRankings());
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Welcome / Quick Actions */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-xl p-6 shadow-lg text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">The political arena awaits.</h1>
            <p className="text-amber-100 max-w-xl">
              Your approval ratings are stable. It's time to make a move. Create a new scenario or join an existing debate.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/lobby')}>Find Game</Button>
            <Button className="bg-white text-amber-900 hover:bg-slate-100" onClick={() => navigate('/lobby')}>Create Scenario</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* News Feed Widget */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
              <Icons.Briefcase className="w-5 h-5 text-amber-500" /> Latest News
            </h2>
            <button className="text-sm text-amber-500 hover:text-amber-400">View All</button>
          </div>

          <div className="grid gap-4">
            {news.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    item.category === 'SCANDAL' ? 'bg-red-900/50 text-red-400' :
                    item.category === 'ECONOMY' ? 'bg-blue-900/50 text-blue-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-500">{item.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-1">{item.headline}</h3>
                <p className="text-sm text-slate-400">{item.preview}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rankings Widget */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <Icons.TrendingUp className="w-5 h-5 text-amber-500" /> Global Rankings
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            {rankings.map((player, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-amber-500 text-black' :
                    index === 1 ? 'bg-slate-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {player.rank}
                  </span>
                  <div>
                    <p className="font-medium text-slate-200">{player.username}</p>
                    <p className="text-xs text-slate-500">{player.faction}</p>
                  </div>
                </div>
                <span className="font-mono text-amber-500 font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;