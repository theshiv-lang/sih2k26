import React from 'react';
import { ShieldCheck, CheckCircle2, FileText, QrCode, Lock, Building, MapPin, Calendar } from 'lucide-react';

export default function DocumentCard({ doc, document: propDoc }) {
  const item = doc || propDoc;

  if (!item) return null;

  const getBadgeStyle = (category) => {
    if (category?.includes("Identity")) return "bg-orange-50 text-orange-800 border-orange-200";
    if (category?.includes("Income")) return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (category?.includes("Category") || category?.includes("Social")) return "bg-amber-50 text-amber-800 border-amber-200";
    if (category?.includes("Land")) return "bg-lime-50 text-lime-800 border-lime-200";
    if (category?.includes("Food")) return "bg-blue-50 text-blue-800 border-blue-200";
    return "bg-slate-50 text-slate-800 border-slate-200";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-4 relative overflow-hidden flex flex-col justify-between">
      
      {/* Card Header */}
      <div className="border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {item?.type || 'Digital Sovereign Document'}
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1">
                {item?.authority || 'Issuing Authority'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold flex-shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Verified</span>
          </div>
        </div>

        {/* Identifier Badge (Strict Placeholder Restraint) */}
        <div className="mt-2.5 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
            Document ID:
          </span>
          <span className="font-mono font-bold text-[11px] text-slate-800 tracking-wider">
            {item?.identifier || 'XXXX-XXXX-XXXX'}
          </span>
        </div>
      </div>

      {/* Field Attributes */}
      <div className="space-y-1.5 text-xs mb-3">
        {item?.fields && Object.entries(item.fields).map(([label, val], idx) => (
          <div key={idx} className="flex items-center justify-between text-[11px] py-0.5">
            <span className="text-slate-400 font-medium">{label}:</span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* Card Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span className="truncate">{item?.validity || 'Permanent Sovereign Record'}</span>
        <span className={`font-medium px-2 py-0.5 rounded-md border text-[9px] ${getBadgeStyle(item?.category)}`}>
          {item?.category || 'Identity Proof'}
        </span>
      </div>

    </div>
  );
}
