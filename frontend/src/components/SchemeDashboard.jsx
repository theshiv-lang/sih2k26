import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SchemeCard from './SchemeCard';
import { Search, CheckCircle2, RefreshCw, Sparkles, Layers } from 'lucide-react';

const CATEGORIES = [
  { id: "All", en: "All Schemes", hi: "सभी योजनाएं" },
  { id: "Agriculture, Rural & Environment", en: "Agriculture & Rural", hi: "कृषि एवं ग्रामीण" },
  { id: "Education & Learning", en: "Education & Learning", hi: "शिक्षा एवं छात्रवृत्ति" },
  { id: "Women and Child", en: "Women & Child", hi: "महिला एवं बाल विकास" },
  { id: "Social Welfare & Empowerment", en: "Social Welfare & Seniors", hi: "सामाजिक कल्याण एवं पेंशन" },
  { id: "Health & Wellness", en: "Health & Wellness", hi: "स्वास्थ्य एवं आयुष्मान" },
  { id: "Business & Entrepreneurship", en: "Business & Startup", hi: "उद्यम एवं मुद्रा ऋण" },
  { id: "Housing & Shelter", en: "Housing & Shelter", hi: "आवास एवं ग्रामीण घर" },
  { id: "Universal Discovery", en: "myScheme Universal", hi: "सार्वभौमिक योजनाएं" },
];

export default function SchemeDashboard() {
  const {
    schemes,
    eligibleCount,
    selectedCategory,
    setSelectedCategory,
    isMatchingLoading,
    runSchemeMatching,
    citizen,
    language,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(false);

  const isHindi = (language || '').startsWith('hi');

  const filteredSchemes = schemes.filter((item) => {
    const matchesSearch =
      item.scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.scheme.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.scheme.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEligibility = onlyEligible ? item.is_eligible : true;
    return matchesSearch && matchesEligibility;
  });

  return (
    <div className="space-y-5">
      
      {/* Search & Category Filter Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi ? "योजना का नाम, श्रेणी या कीवर्ड खोजें (उदा. किसान, छात्रवृत्ति, मुद्रा)..." : "Search 4,770+ official schemes (e.g. Kisan, Scholarship, Stand-Up India)..."}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-slate-300 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Only Eligible Toggle */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setOnlyEligible(!onlyEligible)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                onlyEligible
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'केवल 100% पात्र' : 'Only 100% Eligible'}</span>
            </button>

            <button
              onClick={() => runSchemeMatching(citizen, selectedCategory, language)}
              disabled={isMatchingLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
              title={isHindi ? "योजनाएं पुनः लोड करें" : "Refresh Scheme Matches"}
            >
              <RefreshCw className={`w-4 h-4 ${isMatchingLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {isHindi ? cat.hi : cat.en}
            </button>
          ))}
        </div>

      </div>

      {/* Summary Stat Banner */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-600">
        <div>
          {isHindi ? (
            <span>कुल <span className="font-bold text-slate-900">{filteredSchemes.length}</span> योजनाएं प्रदर्शित {eligibleCount > 0 && <span>• <span className="font-bold text-emerald-700">{eligibleCount}</span> आपकी प्रोफ़ाइल के लिए पूरी तरह पात्र</span>}</span>
          ) : (
            <span>Showing <span className="font-bold text-slate-900">{filteredSchemes.length}</span> verified official schemes {eligibleCount > 0 && <span>• <span className="font-bold text-emerald-700">{eligibleCount}</span> fully eligible for active demographic</span>}</span>
          )}
        </div>
        {isMatchingLoading && (
          <span className="text-xs text-orange-600 font-medium animate-pulse">
            {isHindi ? "पात्रता मानदंडों का वास्तविक समय में मूल्यांकन किया जा रहा है..." : "Evaluating official criteria in real-time..."}
          </span>
        )}
      </div>

      {/* Schemes Grid */}
      {filteredSchemes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">
            {isHindi ? "कोई योजना नहीं मिली" : "No matching schemes found"}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {isHindi ? "कृपया अपना खोज शब्द बदलें या प्रोफ़ाइल विवरण संपादित करें।" : "Try adjusting your search query, clearing filters, or editing your profile in the Custom DigiLocker Vault."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchemes.map((matchResult) => (
            <SchemeCard key={matchResult.scheme.id} matchResult={matchResult} />
          ))}
        </div>
      )}

    </div>
  );
}
