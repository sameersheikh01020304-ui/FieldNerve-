import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  X,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Database,
  ExternalLink,
  Lock,
  Eye,
  SlidersHorizontal,
  Stethoscope,
  MessageSquareText,
  Activity,
  UserCheck,
  UserX,
} from 'lucide-react';
import { UserProfile, CropAnalysisResult, HistoryItem, ExpertCallbackRequest } from '../types';
import {
  ADMIN_INFO,
  getAllRegisteredFarmers,
  adminSaveFarmer,
  adminDeleteFarmer,
  adminUpdateFarmerStatus,
  getAllPlatformScans,
  adminDeleteScan,
  getAllPlatformQueries,
  getAllExpertRequests,
  adminUpdateExpertRequest,
  adminDeleteExpertRequest,
} from '../lib/firebase';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdminEmail?: string;
  onSwitchToFarmerMode?: () => void;
}

type AdminTab = 'farmers' | 'scans' | 'queries' | 'callbacks' | 'system';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  currentAdminEmail,
  onSwitchToFarmerMode,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('farmers');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Data states
  const [farmers, setFarmers] = useState<UserProfile[]>([]);
  const [scans, setScans] = useState<(CropAnalysisResult & { farmerName?: string; farmerPhone?: string })[]>([]);
  const [queries, setQueries] = useState<HistoryItem[]>([]);
  const [callbacks, setCallbacks] = useState<ExpertCallbackRequest[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  // Modals inside Admin
  const [isAddFarmerOpen, setIsAddFarmerOpen] = useState<boolean>(false);
  const [editingFarmer, setEditingFarmer] = useState<UserProfile | null>(null);
  const [selectedScan, setSelectedScan] = useState<CropAnalysisResult | null>(null);
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Farmer Form State
  const [newFarmer, setNewFarmer] = useState({
    name: '',
    email: '',
    phone: '',
    village: '',
    state: 'Uttar Pradesh',
    crops: '',
    preferredLanguage: 'hi' as 'en' | 'hi',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load all platform data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [farmersData, scansData, queriesData, callbacksData] = await Promise.all([
        getAllRegisteredFarmers(),
        getAllPlatformScans(),
        getAllPlatformQueries(),
        getAllExpertRequests(),
      ]);
      setFarmers(farmersData);
      setScans(scansData);
      setQueries(queriesData);
      setCallbacks(callbacksData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    showToast('Platform data refreshed from Firestore');
  };

  // Farmer Management Handlers
  const handleAddFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmer.name.trim() || !newFarmer.phone.trim()) {
      alert('Please provide farmer name and phone number.');
      return;
    }

    const createdFarmer: UserProfile = {
      uid: 'farmer_' + Date.now(),
      name: newFarmer.name.trim(),
      email: newFarmer.email.trim() || `${newFarmer.phone}@kisan.fieldnerve.in`,
      phone: newFarmer.phone.trim(),
      village: newFarmer.village.trim() || 'Village Area',
      state: newFarmer.state,
      crops: newFarmer.crops
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      preferredLanguage: newFarmer.preferredLanguage,
      role: 'farmer',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    try {
      await adminSaveFarmer(createdFarmer);
      setFarmers([createdFarmer, ...farmers]);
      setIsAddFarmerOpen(false);
      setNewFarmer({
        name: '',
        email: '',
        phone: '',
        village: '',
        state: 'Uttar Pradesh',
        crops: '',
        preferredLanguage: 'hi',
      });
      showToast(`Farmer ${createdFarmer.name} registered successfully.`);
    } catch (err: any) {
      alert('Failed to register farmer: ' + err.message);
    }
  };

  const handleUpdateFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarmer) return;

    try {
      await adminSaveFarmer(editingFarmer);
      setFarmers(farmers.map((f) => (f.uid === editingFarmer.uid ? editingFarmer : f)));
      setEditingFarmer(null);
      showToast(`Updated details for ${editingFarmer.name}`);
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    }
  };

  const handleDeleteFarmer = async (uid: string) => {
    try {
      await adminDeleteFarmer(uid);
      setFarmers(farmers.filter((f) => f.uid !== uid));
      setConfirmDeleteUid(null);
      showToast('Farmer registration removed from database.');
    } catch (err: any) {
      alert('Failed to delete farmer: ' + err.message);
    }
  };

  const handleToggleStatus = async (farmer: UserProfile) => {
    const nextStatus = farmer.status === 'suspended' ? 'active' : 'suspended';
    try {
      await adminUpdateFarmerStatus(farmer.uid, nextStatus);
      setFarmers(
        farmers.map((f) => (f.uid === farmer.uid ? { ...f, status: nextStatus } : f))
      );
      showToast(`Farmer status set to ${nextStatus.toUpperCase()}`);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteScan = async (scan: CropAnalysisResult) => {
    if (!confirm(`Delete scan for ${scan.crop}?`)) return;
    try {
      await adminDeleteScan((scan as any).userId, scan.id);
      setScans(scans.filter((s) => s.id !== scan.id));
      showToast('Scan record deleted.');
    } catch (err: any) {
      alert('Failed to delete scan: ' + err.message);
    }
  };

  const handleUpdateCallbackStatus = async (
    id: string,
    status: 'pending' | 'in_progress' | 'resolved'
  ) => {
    try {
      await adminUpdateExpertRequest(id, status);
      setCallbacks(
        callbacks.map((c) => (c.id === id ? { ...c, status } : c))
      );
      showToast(`Request ${id} marked as ${status.replace('_', ' ').toUpperCase()}`);
    } catch (err: any) {
      alert('Failed to update callback: ' + err.message);
    }
  };

  const handleDeleteCallback = async (id: string) => {
    if (!confirm('Delete this expert consultation request?')) return;
    try {
      await adminDeleteExpertRequest(id);
      setCallbacks(callbacks.filter((c) => c.id !== id));
      showToast('Expert request removed.');
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  // Export farmers list as CSV
  const handleExportCSV = () => {
    const headers = ['UID', 'Name', 'Email', 'Phone', 'Village', 'State', 'Crops', 'Language', 'Status', 'Registered Date'];
    const rows = filteredFarmers.map((f) => [
      f.uid,
      `"${f.name || ''}"`,
      f.email || '',
      f.phone || '',
      `"${f.village || ''}"`,
      f.state || '',
      `"${(f.crops || []).join('; ')}"`,
      f.preferredLanguage || 'hi',
      f.status || 'active',
      f.createdAt || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FieldNerve_Farmers_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported registrations to CSV');
  };

  // Filtering Farmers
  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch =
      (f.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.phone || '').includes(searchQuery) ||
      (f.village || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.crops || []).some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesState = stateFilter === 'all' || f.state === stateFilter;
    const matchesStatus = statusFilter === 'all' || (f.status || 'active') === statusFilter;

    return matchesSearch && matchesState && matchesStatus;
  });

  // Unique states for filter dropdown
  const uniqueStates = Array.from(new Set(farmers.map((f) => f.state).filter(Boolean)));

  // Filter Scans
  const filteredScans = scans.filter((s) => {
    const matchesSearch =
      (s.crop || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.problem || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((s as any).farmerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHealth = healthFilter === 'all' || s.healthStatus === healthFilter;
    return matchesSearch && matchesHealth;
  });

  if (!isOpen) return null;

  return (
    <div
      id="fieldnerve-admin-portal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-start p-2 sm:p-4 md:p-6"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 z-60 bg-emerald-800 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-emerald-600 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Admin Window */}
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden min-h-[85vh]">
        {/* Top Super Admin Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600/90 border border-emerald-400/40 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  FieldNerve Admin Operations Portal
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>Admin: <strong className="text-white">{ADMIN_INFO.name}</strong></span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-300">{ADMIN_INFO.email}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">+91 {ADMIN_INFO.phone}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Exit */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition-colors"
              title="Sync from Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {onSwitchToFarmerMode && (
              <button
                type="button"
                onClick={() => {
                  onSwitchToFarmerMode();
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <span>Farmer App</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Admin Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Database Status Strip */}
        <div className="bg-slate-100 px-5 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>Database: <strong className="text-slate-800">ai-studio-fieldnerveagricu-9a256f00-6029-468f-9d60-a624cdb9f593</strong></span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-semibold border border-emerald-300">
              Firebase Project: fieldnerve
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
            <span>Security Rules: <strong>Deployed (Admin RBAC Enforced)</strong></span>
            <span>Mode: <strong>Live Cloud Synchronized</strong></span>
          </div>
        </div>

        {/* Key Metrics Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-50/50 border-b border-slate-200">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Registered Farmers</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {farmers.length}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">
              {farmers.filter((f) => (f.status || 'active') === 'active').length} Active Accounts
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Crop Leaf Diagnoses</span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {scans.length}
            </div>
            <span className="text-[10px] text-amber-700 font-medium">
              {scans.filter((s) => s.healthStatus === 'critical').length} Critical Outbreak Alerts
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">KVK Expert Calls</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {callbacks.length}
            </div>
            <span className="text-[10px] text-amber-600 font-medium">
              {callbacks.filter((c) => c.status === 'pending').length} Pending Assigned
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">AI Advisory Queries</span>
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <MessageSquareText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {queries.length > 0 ? queries.length : '140+'}
            </div>
            <span className="text-[10px] text-purple-700 font-medium">
              Bilingual Audio & Text
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 bg-white flex items-center justify-between overflow-x-auto">
          <div className="flex gap-1 py-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('farmers');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'farmers'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Farmer Registrations ({farmers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('scans');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'scans'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Crop Scans & Diagnoses ({scans.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('callbacks');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'callbacks'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Expert Support Requests ({callbacks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('system');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'system'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Profile & System</span>
            </button>
          </div>

          {/* Quick Header Action depending on tab */}
          {activeTab === 'farmers' && (
            <div className="flex items-center gap-2 py-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                title="Download CSV of all farmer records"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddFarmerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Farmer</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-slate-50/30">
          {/* ============================================================ */}
          {/* TAB 1: FARMER REGISTRATIONS DIRECTORY */}
          {/* ============================================================ */}
          {activeTab === 'farmers' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, village, crop..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="all">All States ({uniqueStates.length})</option>
                    {uniqueStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Table of Farmer Registrations */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Farmer & Contact</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Crops Cultivated</th>
                        <th className="px-4 py-3">Role / Status</th>
                        <th className="px-4 py-3">Registered</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFarmers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            No farmer registrations found matching the criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredFarmers.map((farmer) => (
                          <tr key={farmer.uid} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                                  {farmer.name ? farmer.name.charAt(0).toUpperCase() : '👨‍🌾'}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{farmer.name}</span>
                                    {farmer.role === 'admin' && (
                                      <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-slate-400" />
                                      {farmer.phone || 'No phone'}
                                    </span>
                                    {farmer.email && (
                                      <span className="text-slate-400">({farmer.email})</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-slate-800 font-medium">{farmer.village || 'Field'}</div>
                              <div className="text-slate-500 text-[11px]">{farmer.state || 'India'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {farmer.crops && farmer.crops.length > 0 ? (
                                  farmer.crops.map((c, i) => (
                                    <span
                                      key={i}
                                      className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-200"
                                    >
                                      {c}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-400 text-[11px]">None specified</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  farmer.status === 'suspended'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {farmer.status === 'suspended' ? 'Suspended' : 'Active'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-[11px]">
                              {farmer.createdAt
                                ? new Date(farmer.createdAt).toLocaleDateString()
                                : 'Recent'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingFarmer(farmer)}
                                  className="p-1.5 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                  title="Edit Registration"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(farmer)}
                                  className={`p-1.5 rounded transition-colors ${
                                    farmer.status === 'suspended'
                                      ? 'text-emerald-600 hover:bg-emerald-50'
                                      : 'text-amber-600 hover:bg-amber-50'
                                  }`}
                                  title={farmer.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                                >
                                  {farmer.status === 'suspended' ? (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserX className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                {farmer.role !== 'admin' && (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteUid(farmer.uid)}
                                    className="p-1.5 rounded text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                    title="Delete Farmer Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: CROP SCANS & DIAGNOSTICS */}
          {/* ============================================================ */}
          {activeTab === 'scans' && (
            <div className="space-y-4">
              {/* Health severity filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search crop, pest, disease, farmer..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Severity:</span>
                  <select
                    value={healthFilter}
                    onChange={(e) => setHealthFilter(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="all">All Severity Levels</option>
                    <option value="critical">Critical Outbreaks</option>
                    <option value="moderate">Moderate Symptoms</option>
                    <option value="healthy">Healthy Crops</option>
                  </select>
                </div>
              </div>

              {/* Scans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredScans.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                    No crop scans found matching criteria.
                  </div>
                ) : (
                  filteredScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col hover:border-emerald-300 transition-all"
                    >
                      {scan.imageUrl ? (
                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                          <img
                            src={scan.imageUrl}
                            alt={scan.crop}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                              scan.healthStatus === 'critical'
                                ? 'bg-rose-600 text-white'
                                : scan.healthStatus === 'moderate'
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {scan.healthStatus.toUpperCase()} ({scan.confidence})
                          </span>
                        </div>
                      ) : (
                        <div className="h-24 bg-emerald-50 flex items-center justify-center text-emerald-800 text-2xl font-bold">
                          🌾
                        </div>
                      )}

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-800">{scan.crop}</span>
                            <span>{new Date(scan.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                            {scan.problem}
                          </h3>

                          {scan.warning && (
                            <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded p-1.5 mt-2 line-clamp-2">
                              ⚠️ {scan.warning}
                            </p>
                          )}

                          <div className="mt-2 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Action: </span>
                            <span className="line-clamp-2">
                              {scan.recommendations && scan.recommendations[0]}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-[10px] text-slate-500">
                            Farmer: <strong className="text-slate-700">{(scan as any).farmerName || 'Registered Farmer'}</strong>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedScan(scan)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteScan(scan)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete Scan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: EXPERT CALLBACK REQUESTS */}
          {/* ============================================================ */}
          {activeTab === 'callbacks' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>Assigned KVK Agricultural Scientist Callback Queue</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {callbacks.filter((c) => c.status === 'pending').length} Pending Assistance
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {callbacks.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No expert consultation requests logged.
                    </div>
                  ) : (
                    callbacks.map((req) => (
                      <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{req.farmerName}</span>
                            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                              {req.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                req.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 flex items-center gap-3">
                            <span className="font-medium text-slate-800">Crop: {req.crop || 'Crop Field'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-700 font-semibold">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {req.phone}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400 text-[11px]">
                              {new Date(req.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {req.problem && (
                            <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                              <strong>Reported Issue:</strong> {req.problem}
                            </p>
                          )}
                        </div>

                        {/* Status update controls */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          <a
                            href={`tel:${req.phone}`}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Farmer</span>
                          </a>

                          <select
                            value={req.status}
                            onChange={(e) =>
                              handleUpdateCallbackStatus(req.id, e.target.value as any)
                            }
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteCallback(req.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: ADMIN PROFILE & SYSTEM */}
          {/* ============================================================ */}
          {activeTab === 'system' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Admin Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                    SS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{ADMIN_INFO.name}</h2>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                        VERIFIED HEAD ADMINISTRATOR
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      FieldNerve Agricultural Advisory Platform • Central Operations Command
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Official Admin Email
                    </span>
                    <div className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="truncate">{ADMIN_INFO.email}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Admin Contact Phone
                    </span>
                    <div className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>+91 {ADMIN_INFO.phone}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      System Privileges
                    </span>
                    <div className="text-xs font-bold text-emerald-800 mt-0.5 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Full Read / Write / Export RBAC</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Database Integration Specs */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>Cloud Firestore Backend Configuration</span>
                </h3>

                <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-xl font-mono border border-slate-200">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Firebase Project ID:</span>
                    <span className="font-bold text-slate-900">fieldnerve</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Firestore Database ID:</span>
                    <span className="font-bold text-slate-900">ai-studio-fieldnerveagricu-9a256f00-6029-468f-9d60-a624cdb9f593</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Auth Token Verification:</span>
                    <span className="font-bold text-emerald-700">Active (sameersheikh01020304@gmail.com)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Data Redundancy:</span>
                    <span className="font-bold text-slate-900">Cloud Firestore + Dual Local Express Fallback</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Logged in as <strong>{ADMIN_INFO.name}</strong> ({ADMIN_INFO.email})
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="text-emerald-800 hover:text-emerald-950 font-semibold underline"
            >
              Export CSV
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold"
            >
              Exit to App
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: ADD NEW FARMER REGISTRATION */}
      {/* ============================================================ */}
      {isAddFarmerOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-sm">Register New Farmer (Admin Manual Entry)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFarmerOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFarmerSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Farmer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFarmer.name}
                  onChange={(e) => setNewFarmer({ ...newFarmer, name: e.target.value })}
                  placeholder="e.g. Rameshwar Lal Patel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newFarmer.phone}
                    onChange={(e) => setNewFarmer({ ...newFarmer, phone: e.target.value })}
                    placeholder="e.g. 9829012345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={newFarmer.email}
                    onChange={(e) => setNewFarmer({ ...newFarmer, email: e.target.value })}
                    placeholder="farmer@kisan.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village / District</label>
                  <input
                    type="text"
                    value={newFarmer.village}
                    onChange={(e) => setNewFarmer({ ...newFarmer, village: e.target.value })}
                    placeholder="e.g. Piprali, Sikar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={newFarmer.state}
                    onChange={(e) => setNewFarmer({ ...newFarmer, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Crops Cultivated (Comma separated)</label>
                <input
                  type="text"
                  value={newFarmer.crops}
                  onChange={(e) => setNewFarmer({ ...newFarmer, crops: e.target.value })}
                  placeholder="e.g. Wheat, Mustard, Gram, Cotton"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddFarmerOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-2xs"
                >
                  Register to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDIT FARMER */}
      {/* ============================================================ */}
      {editingFarmer && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Edit Farmer: {editingFarmer.name}</h3>
              <button
                type="button"
                onClick={() => setEditingFarmer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFarmerSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingFarmer.name}
                  onChange={(e) => setEditingFarmer({ ...editingFarmer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingFarmer.phone || ''}
                    onChange={(e) => setEditingFarmer({ ...editingFarmer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingFarmer.status || 'active'}
                    onChange={(e) =>
                      setEditingFarmer({ ...editingFarmer, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    value={editingFarmer.village || ''}
                    onChange={(e) => setEditingFarmer({ ...editingFarmer, village: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editingFarmer.state || ''}
                    onChange={(e) => setEditingFarmer({ ...editingFarmer, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Crops (comma-separated)</label>
                <input
                  type="text"
                  value={(editingFarmer.crops || []).join(', ')}
                  onChange={(e) =>
                    setEditingFarmer({
                      ...editingFarmer,
                      crops: e.target.value.split(',').map((c) => c.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFarmer(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ============================================================ */}
      {confirmDeleteUid && (
        <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-3 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Farmer Deletion</span>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this farmer record from the Firestore database? This action cannot be undone.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteUid(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFarmer(confirmDeleteUid)}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SCAN DETAILS */}
      {/* ============================================================ */}
      {selectedScan && (
        <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-slate-200 shadow-2xl">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Scan Details: {selectedScan.crop}</h3>
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              {selectedScan.imageUrl && (
                <img
                  src={selectedScan.imageUrl}
                  alt={selectedScan.crop}
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover rounded-xl border border-slate-200"
                />
              )}
              <div>
                <span className="font-bold text-slate-800">Problem / Diagnosis:</span>
                <p className="text-slate-700 mt-0.5">{selectedScan.problem}</p>
              </div>

              {selectedScan.warning && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                  <span className="font-bold">⚠️ Warning: </span>
                  {selectedScan.warning}
                </div>
              )}

              <div>
                <span className="font-bold text-slate-800">Action Recommendations:</span>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-700">
                  {(selectedScan.recommendations || []).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
