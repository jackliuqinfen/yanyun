
import React, { useState } from 'react';
import { geminiService, SearchResult } from '../services/geminiService';
import { Search, Loader2, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion component to resolve type mismatch on properties like 'animate'
const MotionDiv = motion.div as any;

const SmartSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await geminiService.searchIndustryNews(query);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative bg-white rounded-2xl shadow-xl border border-blue-50 overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-white rounded-lg border border-blue-100">
               <Sparkles className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-none">AI 行业智库</h3>
              <p className="text-xs text-gray-500 mt-1">基于 Gemini 3.0 的实时政策与招标检索</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative group">
            <div className={`absolute inset-0 bg-primary/20 rounded-xl blur transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'}`}></div>
            <div className="relative flex items-center bg-white border border-gray-200 rounded-xl shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300">
              <Search className="ml-4 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="尝试搜索：江苏省2025年重点工程名单..."
                className="flex-1 px-4 py-4 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="mr-2 bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center min-w-[44px]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              </button>
            </div>
          </form>

          <AnimatePresence>
            {result && (
              <MotionDiv
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-50/80 rounded-xl p-6 border border-gray-100">
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-6">
                    {result.text.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 last:mb-0">{line}</p>
                    ))}
                  </div>
                  
                  {result.sources.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">参考来源</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.sources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200 hover:border-primary hover:text-primary transition-colors group"
                          >
                            <ExternalLink size={12} className="text-gray-400 group-hover:text-primary" />
                            <span className="truncate">{source.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SmartSearch;
