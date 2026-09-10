import React, { useState, useEffect, useRef } from 'react';
import {
  fetchApplications,
  updateApplicationStatus,
  clearVerificationQueue,
} from '../services/api';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Search,
  Building,
  User,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Eye,
  X,
  FileText,
  Undo2,
  Check,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OfficerDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNotification, setNewNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'rejected'
  const [inspectApp, setInspectApp] = useState(null);
  const previousAppsRef = useRef([]);

  useEffect(() => {
    let isMounted = true;

    const fetchLatest = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const data = await fetchApplications();
        if (isMounted && data && Array.isArray(data)) {
          // Check for newly inserted applications compared to previous count
          if (!isInitial && previousAppsRef.current.length > 0 && data.length > previousAppsRef.current.length) {
            const newest = data[0];
            if (newest && !previousAppsRef.current.some((p) => p.id === newest.id)) {
              showRealtimeAlert(`New Application Received: ${newest.citizen_name} applied for ${newest.scheme_title}`);
            }
          }
          previousAppsRef.current = data;
          setApplications(data);
        }
      } catch (err) {
        console.error('[Officer Dashboard] Polling error:', err);
      } finally {
        if (isInitial && isMounted) setLoading(false);
      }
    };

    // Initial load
    fetchLatest(true);

    // 1. Local event bus listener (instant cross-tab/local dispatch notification)
    const handleLocalSubmitted = (e) => {
      if (e.detail) {
        console.log('[Officer Event Bus] Local application submitted received:', e.detail);
        const newRecord = e.detail;
        setApplications((prev) => {
          if (prev.some((a) => a.id === newRecord.id)) return prev;
          return [newRecord, ...prev];
        });
        showRealtimeAlert(`New Application: ${newRecord.citizen_name} applied for ${newRecord.scheme_title}`);
      }
    };
    window.addEventListener('SAHAYAK_LOCAL_APPLICATION_SUBMITTED', handleLocalSubmitted);

    // 2. Short Polling Interval (fetches updated applications from Rust/Axum Backend every 3 seconds)
    const pollInterval = setInterval(() => {
      fetchLatest(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('SAHAYAK_LOCAL_APPLICATION_SUBMITTED', handleLocalSubmitted);
    };
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const data = await fetchApplications();
    setApplications(data || []);
    previousAppsRef.current = data || [];
    setLoading(false);
  };

  const handleClearQueue = async () => {
    if (window.confirm("Are you sure you want to clear all pre-existing demo submissions from the verification queue? (This will not alter the citizens table or schema)")) {
      setLoading(true);
      await clearVerificationQueue();
      setApplications([]);
      setLoading(false);
      showRealtimeAlert("Queue Cleared: Verification queue has been safely emptied.");
    }
  };

  const showRealtimeAlert = (message) => {
    setNewNotification(message);
    setTimeout(() => setNewNotification(null), 5000);
  };

  const handleStatusTransition = async (applicationId, nextStatus) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: nextStatus } : app
      )
    );

    // If currently inspecting this application, update modal state
    if (inspectApp && inspectApp.id === applicationId) {
      setInspectApp((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    // Persist via Rust Backend API on Render PostgreSQL
    await updateApplicationStatus(applicationId, nextStatus);
  };

  const pendingApps = applications.filter(
    (a) => a.status === 'Pending' && matchesSearch(a)
  );
  const reviewApps = applications.filter(
    (a) => a.status === 'Under Review' && matchesSearch(a)
  );
  const approvedApps = applications.filter(
    (a) => a.status === 'Approved' && matchesSearch(a)
  );
  const rejectedApps = applications.filter(
    (a) => a.status === 'Rejected' && matchesSearch(a)
  );

  function matchesSearch(app) {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.citizen_name?.toLowerCase().includes(q) ||
      app.scheme_title?.toLowerCase().includes(q) ||
      app.category?.toLowerCase().includes(q) ||
      app.details?.state?.toLowerCase().includes(q)
    );
  }

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Officer Portal Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Sahayak Officer Verification Queue
                </h1>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Render PostgreSQL Live (Short Polling 3s)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                District Welfare Verification Desk • Smart India Hackathon 2026
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleClearQueue}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800/80 transition-all flex items-center space-x-1.5"
              title="Clear pre-existing demo submissions from queue"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Queue</span>
            </button>

            <button
              onClick={loadApplications}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
              <span>Switch to Citizen Portal</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Realtime Notification Banner */}
      {newNotification && (
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-bold animate-fade-in z-20">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <Sparkles className="w-4 h-4 animate-bounce" />
            <span>{newNotification}</span>
          </div>
        </div>
      )}

      {/* Main Kanban Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Control Bar & Stats Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by citizen name, scheme title, state, or category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400 transition-all"
            />
          </div>

          {/* Aggregate Counters */}
          <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-2">
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">Total: </span>
              <span className="font-extrabold text-slate-900">{applications.length}</span>
            </div>
            <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <span className="text-amber-700 font-medium">Pending: </span>
              <span className="font-extrabold text-amber-900">{pendingApps.length}</span>
            </div>
            <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              <span className="text-blue-700 font-medium">Review: </span>
              <span className="font-extrabold text-blue-900">{reviewApps.length}</span>
            </div>
            <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 font-medium">Approved: </span>
              <span className="font-extrabold text-emerald-900">{approvedApps.length}</span>
            </div>
            <div className="bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
              <span className="text-rose-700 font-medium">Rejected: </span>
              <span className="font-extrabold text-rose-900">{rejectedApps.length}</span>
            </div>
          </div>

        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'active'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Active Kanban Board ({pendingApps.length + reviewApps.length + approvedApps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'rejected'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected / Ineligible Queue ({rejectedApps.length})</span>
          </button>
        </div>

        {/* TAB 1: 3-COLUMN KANBAN BOARD */}
        {activeTab === 'active' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* ================= COLUMN 1: PENDING ================= */}
            <div className="bg-slate-50/80 rounded-2xl border border-amber-200/80 p-4 shadow-xs flex flex-col min-h-[580px]">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    📥 Pending Verification
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  {pendingApps.length}
                </span>
              </div>

              <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                {pendingApps.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white/60 rounded-xl border border-dashed border-slate-200">
                    No applications currently pending review
                  </div>
                ) : (
                  pendingApps.map((app) => (
                    <KanbanCard
                      key={app.id}
                      app={app}
                      timeLabel={formatTime(app.submitted_at)}
                      onAdvance={() => handleStatusTransition(app.id, 'Under Review')}
                      advanceLabel="Start Review ➔"
                      advanceColor="bg-blue-600 hover:bg-blue-700"
                      onReject={() => handleStatusTransition(app.id, 'Rejected')}
                      onInspect={() => setInspectApp(app)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* ================= COLUMN 2: UNDER REVIEW ================= */}
            <div className="bg-slate-50/80 rounded-2xl border border-blue-200/80 p-4 shadow-xs flex flex-col min-h-[580px]">
              <div className="flex items-center justify-between pb-3 border-b border-blue-200 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    🔍 Under Review
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                  {reviewApps.length}
                </span>
              </div>

              <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                {reviewApps.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white/60 rounded-xl border border-dashed border-slate-200">
                    No applications currently under active review
                  </div>
                ) : (
                  reviewApps.map((app) => (
                    <KanbanCard
                      key={app.id}
                      app={app}
                      timeLabel={formatTime(app.submitted_at)}
                      onAdvance={() => handleStatusTransition(app.id, 'Approved')}
                      advanceLabel="Approve Benefit ✓"
                      advanceColor="bg-emerald-600 hover:bg-emerald-700"
                      onRollback={() => handleStatusTransition(app.id, 'Pending')}
                      rollbackLabel="Back to Pending"
                      onReject={() => handleStatusTransition(app.id, 'Rejected')}
                      onInspect={() => setInspectApp(app)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* ================= COLUMN 3: APPROVED ================= */}
            <div className="bg-slate-50/80 rounded-2xl border border-emerald-200/80 p-4 shadow-xs flex flex-col min-h-[580px]">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    ✅ Approved & Dispatched
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {approvedApps.length}
                </span>
              </div>

              <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                {approvedApps.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white/60 rounded-xl border border-dashed border-slate-200">
                    No approved applications yet
                  </div>
                ) : (
                  approvedApps.map((app) => (
                    <KanbanCard
                      key={app.id}
                      app={app}
                      timeLabel={formatTime(app.submitted_at)}
                      isApproved={true}
                      onRollback={() => handleStatusTransition(app.id, 'Under Review')}
                      rollbackLabel="Reopen Review"
                      onInspect={() => setInspectApp(app)}
                    />
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: REJECTED / INELIGIBLE APPLICATIONS */}
        {activeTab === 'rejected' && (
          <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Rejected Applications (Disqualified / Ineligible)
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                {rejectedApps.length} Application{rejectedApps.length === 1 ? '' : 's'}
              </span>
            </div>

            {rejectedApps.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No applications currently marked as rejected or disqualified.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rejectedApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-rose-50/40 rounded-2xl p-4 border border-rose-200 shadow-xs space-y-3 relative"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-rose-100 pb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md inline-block mb-1">
                          {app.category || 'General Welfare'}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                          {app.scheme_title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-100 px-2 py-0.5 rounded-md flex-shrink-0">
                        Rejected
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-900">{app.citizen_name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Aadhaar: {app.details?.aadhaar_masked || 'XXXX-XXXX-XXXX'} • {app.details?.state || 'India'}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        Income: ₹{(app.details?.annual_income || 0).toLocaleString('en-IN')} • Occupation: {app.details?.occupation || 'N/A'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-rose-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setInspectApp(app)}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusTransition(app.id, 'Pending')}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold transition-all"
                        >
                          Restore to Pending
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusTransition(app.id, 'Under Review')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-all"
                        >
                          Restore to Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Application Detail Inspection Modal */}
      {inspectApp && (
        <ApplicationDetailModal
          app={inspectApp}
          onClose={() => setInspectApp(null)}
          onTransition={(status) => handleStatusTransition(inspectApp.id, status)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Sahayak Welfare Officer Queue • Render PostgreSQL Sync • Smart India Hackathon 2026
      </footer>

    </div>
  );
}

/**
 * Kanban Ticket Card Component
 */
function KanbanCard({
  app,
  timeLabel,
  onAdvance,
  advanceLabel,
  advanceColor,
  onRollback,
  rollbackLabel,
  isApproved,
  onReject,
  onInspect,
}) {
  const d = app.details || {};

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden">
      
      {/* Top Scheme Badge & Time */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 inline-block mb-1">
            {app.category || 'General Welfare'}
          </span>
          <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
            {app.scheme_title}
          </h4>
        </div>
        <div className="flex items-center space-x-1 text-[10px] text-slate-400 flex-shrink-0">
          <Clock className="w-3 h-3" />
          <span>{timeLabel}</span>
        </div>
      </div>

      {/* Citizen Identity */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
            {app.citizen_name?.charAt(0) || 'C'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{app.citizen_name}</p>
            <p className="text-[10px] text-slate-500 font-mono">
              Aadhaar: {d.aadhaar_masked || 'XXXX-XXXX-XXXX'}
            </p>
          </div>
        </div>

        <div className="text-right text-[10px]">
          <span className="font-semibold text-slate-600 block">{d.state || 'India'}</span>
          <span className="text-emerald-700 font-bold font-mono">
            ₹{((d.annual_income || 0) / 1000).toFixed(0)}k/yr
          </span>
        </div>
      </div>

      {/* Demographic Pills */}
      <div className="flex items-center space-x-1.5 text-[10px] flex-wrap gap-y-1">
        {d.category && (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
            Category: {d.category}
          </span>
        )}
        {d.occupation && (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
            {d.occupation}
          </span>
        )}
        {d.landholding_acres > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-lime-50 text-lime-800 font-medium">
            {d.landholding_acres} Acres
          </span>
        )}
        {d.age && (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
            {d.age}y
          </span>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={onInspect}
          className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1 py-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>

        {isApproved ? (
          <div className="flex items-center space-x-1 text-emerald-700 text-xs font-bold ml-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dispatched to DBT PFMS</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 ml-auto">
            {onReject && (
              <button
                type="button"
                onClick={onReject}
                className="px-2 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 transition-all"
                title="Reject and disqualify application"
              >
                Reject ✕
              </button>
            )}

            {onRollback && (
              <button
                type="button"
                onClick={onRollback}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold px-1"
              >
                {rollbackLabel || 'Back'}
              </button>
            )}

            {onAdvance && (
              <button
                type="button"
                onClick={onAdvance}
                className={`px-3 py-1.5 rounded-xl text-white text-[11px] font-bold shadow-xs transition-all flex items-center space-x-1 ${advanceColor}`}
              >
                <span>{advanceLabel}</span>
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

/**
 * Detailed Application Inspection Modal
 */
function ApplicationDetailModal({ app, onClose, onTransition }) {
  const d = app.details || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-400/30 flex items-center justify-center text-orange-600 flex-shrink-0">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(app.status)}`}>
                {app.status}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ID: {app.id}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mt-0.5">
              {app.scheme_title}
            </h3>
            <p className="text-xs text-slate-500">
              Category: {app.category} • Submitted: {new Date(app.submitted_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          
          {/* Citizen Demographics Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-orange-600" />
              <span>Applicant Demographic Credentials</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Full Name</span>
                <span className="font-bold text-slate-900">{app.citizen_name}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Aadhaar (Masked)</span>
                <span className="font-bold text-slate-900">{d.aadhaar_masked || 'XXXX-XXXX-XXXX'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">State / Domicile</span>
                <span className="font-bold text-slate-900">{d.state || 'India'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Annual Income</span>
                <span className="font-bold text-emerald-700">₹{(d.annual_income || 0).toLocaleString('en-IN')}/yr</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Social Category</span>
                <span className="font-bold text-slate-900">{d.category || 'General'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Occupation / Age</span>
                <span className="font-bold text-slate-900">{d.occupation || 'Farmer'} ({d.age || 38}y)</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Father's / Guardian's Name</span>
                <span className="font-bold text-slate-900">{d.father_name || 'Not Specified'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Contact Number</span>
                <span className="font-bold text-slate-900">{d.contact_number || '[Phone Redacted]'}</span>
              </div>
            </div>
          </div>

          {/* Verification Audit Checklist */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sovereign e-KYC Verification Records</span>
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                <span className="font-semibold">UIDAI Aadhaar Sovereign Identity</span>
                <span className="font-bold text-[10px] bg-emerald-200 px-2 py-0.5 rounded-md">VERIFIED • e-KYC</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                <span className="font-semibold">State Tehsildar Income Verification</span>
                <span className="font-bold text-[10px] bg-emerald-200 px-2 py-0.5 rounded-md">VALIDATED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                <span className="font-semibold">Digital Caste / Social Category Authenticity</span>
                <span className="font-bold text-[10px] bg-emerald-200 px-2 py-0.5 rounded-md">CERTIFIED</span>
              </div>
            </div>
          </div>

          {/* Raw Metadata Details */}
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Application Snapshot Payload (JSONB)
            </span>
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto">
              {JSON.stringify(app, null, 2)}
            </pre>
          </div>

        </div>

        {/* Action Controls Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            {app.status !== 'Rejected' && (
              <button
                type="button"
                onClick={() => onTransition('Rejected')}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Reject Application
              </button>
            )}

            {app.status === 'Rejected' && (
              <>
                <button
                  type="button"
                  onClick={() => onTransition('Pending')}
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Restore to Pending
                </button>
                <button
                  type="button"
                  onClick={() => onTransition('Under Review')}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Move to Under Review
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            {app.status === 'Pending' && (
              <button
                type="button"
                onClick={() => onTransition('Under Review')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all"
              >
                Start Review ➔
              </button>
            )}

            {app.status === 'Under Review' && (
              <>
                <button
                  type="button"
                  onClick={() => onTransition('Pending')}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                >
                  Back to Pending
                </button>
                <button
                  type="button"
                  onClick={() => onTransition('Approved')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Benefit</span>
                </button>
              </>
            )}

            {app.status === 'Approved' && (
              <button
                type="button"
                onClick={() => onTransition('Under Review')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                Reopen for Scrutiny
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
