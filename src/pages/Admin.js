import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient, API_BASE_URL } from '../config/api';
import { Activity, BarChart3, Clock, Database, Globe, HeartPulse, History, Link as LinkIcon, RefreshCw, Search, Server, ShieldAlert, Users } from 'lucide-react';
import ConnectionTester from '../components/ConnectionTester';

const StatCard = ({ title, value, icon: Icon, subtitle }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
    <div className="p-3 rounded-lg bg-teal-50 dark:bg-slate-700 text-teal-600 dark:text-teal-300">
      <Icon size={20} />
    </div>
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      {subtitle && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</div>}
    </div>
  </div>
);

const Admin = () => {
  const { darkMode, userData } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessionIdQuery, setSessionIdQuery] = useState('');
  const [historyResult, setHistoryResult] = useState(null);
  const [polling, setPolling] = useState(true);
  const prevStatsRef = useRef(null);
  const lastUpdatedRef = useRef(null);
  const [traffic, setTraffic] = useState(null);

  const fetchAll = async () => {
    try {
      setError('');
      const [s, h, st] = await Promise.all([
        apiClient.getStatus(),
        apiClient.health(),
        apiClient.getStats().catch(() => null)
      ]);
      setStatus(s);
      setHealth(h);
      if (st && st.stats) setStats(st.stats);
      lastUpdatedRef.current = new Date();
      try {
        const r = await fetch('/api/admin/stats');
        if (r.ok) {
          const data = await r.json();
          if (data.success) setTraffic(data);
        }
      } catch {}
    } catch (e) {
      setError(e.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!polling) return;
    const id = setInterval(fetchAll, 15000);
    return () => clearInterval(id);
  }, [polling]);

  const handleSearchHistory = async (e) => {
    e.preventDefault();
    if (!sessionIdQuery.trim()) return;
    try {
      const res = await apiClient.getHistory(sessionIdQuery.trim(), 50);
      setHistoryResult(res);
    } catch (e) {
      setHistoryResult({ error: e.message || 'Failed to fetch history' });
    }
  };

  const trafficRates = useMemo(() => {
    if (!stats || !prevStatsRef.current || !lastUpdatedRef.current) {
      prevStatsRef.current = stats;
      return null;
    }
    const prev = prevStatsRef.current;
    const now = stats;
    const seconds = Math.max(1, (new Date() - lastUpdatedRef.current) / 1000);
    const rate = (curr, p) => p != null ? Math.max(0, curr - p) / seconds : null;
    const rates = {
      diagnosesPerSec: rate(now.total_diagnoses, prev.total_diagnoses),
      imageAnalysesPerSec: rate(now.total_image_analyses, prev.total_image_analyses),
      conversationsPerSec: rate(now.total_conversations, prev.total_conversations)
    };
    prevStatsRef.current = stats;
    lastUpdatedRef.current = new Date();
    return rates;
  }, [stats]);

  if (userData?.role !== 'admin') {
    return (
      <div className="p-8">
        <div className="max-w-xl mx-auto bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
          <div className="text-yellow-700 dark:text-yellow-300 font-semibold mb-1">Access restricted</div>
          <div className="text-sm text-yellow-800 dark:text-yellow-200">You must be logged in with admin credentials to view this page.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Portal</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Monitor system status, usage, and sessions in real time</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setPolling((p) => !p)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${polling ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
            <Activity size={16} /> {polling ? 'Live: On' : 'Live: Off'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-start gap-3">
          <ShieldAlert size={20} className="mt-0.5" />
          <div>
            <div className="font-semibold">{error}</div>
            <div className="text-sm">Ensure the Colab server and ngrok URL are active.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="API" value={API_BASE_URL?.replace('https://','') || 'Not configured'} icon={LinkIcon} subtitle="Backend Base URL" />
        <StatCard title="Database" value={status?.database || 'unknown'} icon={Database} subtitle="MongoDB connection" />
        <StatCard title="Device" value={status?.device || 'n/a'} icon={Server} subtitle="Compute target" />
        <StatCard title="Health" value={health?.status || 'n/a'} icon={HeartPulse} subtitle={health?.timestamp ? new Date(health.timestamp).toLocaleString() : ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-teal-600" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Usage Stats</h2>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{new Date().toLocaleTimeString()}</div>
            </div>
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Symptom Sessions" value={stats.total_symptom_sessions ?? 0} icon={Activity} />
                <StatCard title="Image Sessions" value={stats.total_image_sessions ?? 0} icon={Globe} />
                <StatCard title="Diagnoses" value={stats.total_diagnoses ?? 0} icon={History} />
                <StatCard title="Image Analyses" value={stats.total_image_analyses ?? 0} icon={Clock} />
                <StatCard title="Conversations" value={stats.total_conversations ?? 0} icon={BarChart3} />
                {traffic?.counts && (
                  <StatCard title="Logins (24h)" value={traffic.counts.login ?? 0} icon={Users} subtitle={`${traffic.activeUsers?.length || 0} active last 15m`} />
                )}
                {traffic?.counts && (
                  <StatCard title="Page Views (24h)" value={traffic.counts.page_view ?? 0} icon={BarChart3} />
                )}
                {trafficRates && (
                  <StatCard title="Traffic (conv/sec)" value={trafficRates.conversationsPerSec?.toFixed(2) ?? '0.00'} icon={Activity} subtitle="Since last refresh" />
                )}
              </div>
            ) : (
              <div className="text-slate-500 dark:text-slate-400 text-sm">Statistics unavailable.</div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-teal-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">System Status</h2>
            </div>
            {status ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-500 dark:text-slate-300">Mode</div>
                  <div className="font-semibold">{status.current_mode || 'idle'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-500 dark:text-slate-300">Symptom Session</div>
                  <div className="font-semibold break-all">{status.symptom_session || '-'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-500 dark:text-slate-300">Image Session</div>
                  <div className="font-semibold break-all">{status.image_session || '-'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 md:col-span-3">
                  <div className="text-slate-500 dark:text-slate-300">Image Loaded</div>
                  <div className="font-semibold">{status.image_loaded ? 'Yes' : 'No'}</div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 dark:text-slate-400 text-sm">Status unavailable.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-teal-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Active Users (last 15m)</h2>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto text-sm">
              {traffic?.activeUsers?.length ? traffic.activeUsers.map(u => (
                <div key={u.user} className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <div className="font-medium break-all">{u.user}</div>
                  <div className="text-slate-500 dark:text-slate-400">{new Date(u.lastSeen).toLocaleTimeString()}</div>
                </div>
              )) : <div className="text-slate-500">No active users</div>}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Search size={18} className="text-teal-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Lookup Session History</h2>
            </div>
            <form onSubmit={handleSearchHistory} className="flex gap-2">
              <input
                value={sessionIdQuery}
                onChange={(e) => setSessionIdQuery(e.target.value)}
                placeholder="Enter session_id (from /status or logs)"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              />
              <button type="submit" className="px-3 py-2 rounded-lg bg-teal-600 text-white">Fetch</button>
            </form>
            <div className="mt-4 max-h-80 overflow-auto space-y-2">
              {historyResult?.error && (
                <div className="text-sm text-red-600 dark:text-red-400">{historyResult.error}</div>
              )}
              {historyResult?.history && historyResult.history.length === 0 && (
                <div className="text-sm text-slate-500">No records</div>
              )}
              {historyResult?.history && historyResult.history.map((h) => (
                <div key={h._id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{new Date(h.timestamp).toLocaleString()} • {h.session_type}</div>
                  <div className="text-sm"><span className="font-semibold">Q:</span> {h.question}</div>
                  <div className="text-sm mt-1"><span className="font-semibold">A:</span> {h.answer?.slice(0, 240)}{h.answer && h.answer.length > 240 ? '…' : ''}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-teal-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Connection</h2>
            </div>
            <ConnectionTester />
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed bottom-4 right-4 px-3 py-2 rounded-md bg-slate-800 text-white text-xs flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin" /> Loading admin data…
        </div>
      )}
    </div>
  );
};

export default Admin;


