import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  Search,
  Filter,
  AlertCircle,
  FileText,
  LayoutDashboard,
  PieChart,
  Settings,
  Loader2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import AddPolicyModal from "../components/AddPolicyModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [user, setUser] = useState({ 
    name: "Loading...", 
    email: "...", 
    avatar: null 
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Filter States
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("endDateAsc");

  const API_URL = import.meta.env.VITE_API_URL;

  // --- 1. Data Fetching Logic (Reusable) ---
  const fetchAllData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Parallel fetching for speed
      const [userRes, policiesRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/policies`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Handle Unauthorized (401)
      if (userRes.status === 401 || policiesRes.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (policiesRes.ok) {
        const policiesData = await policiesRes.json();
        setPolicies(Array.isArray(policiesData) ? policiesData : []);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      toast.error("Failed to sync data");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Initial Load Effect ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    fetchAllData();
  }, [navigate, API_URL]);

  // --- Helpers & Calculations ---
  const daysLeft = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=4f46e5&color=fff&bold=true`;
  };

  const filteredSorted = useMemo(() => {
    if (!Array.isArray(policies)) return [];

    let list = [...policies];

    // Search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.policyNumber && p.policyNumber.toLowerCase().includes(q)) ||
          (p.type && p.type.toLowerCase().includes(q))
      );
    }

    // Filter
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);

    // Sort
    const byEnd = (a, b) => new Date(a.endDate) - new Date(b.endDate);
    const byEndDesc = (a, b) => new Date(b.endDate) - new Date(a.endDate);
    const byPremiumHigh = (a, b) => (b.premiumAmount || 0) - (a.premiumAmount || 0);
    const byPremiumLow = (a, b) => (a.premiumAmount || 0) - (b.premiumAmount || 0);

    switch (sortKey) {
      case "endDateAsc": list.sort(byEnd); break;
      case "endDateDesc": list.sort(byEndDesc); break;
      case "premiumHigh": list.sort(byPremiumHigh); break;
      case "premiumLow": list.sort(byPremiumLow); break;
      default: break;
    }

    return list;
  }, [policies, query, statusFilter, sortKey]);

  // --- Actions ---
  const deletePolicy = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to remove this policy?")) return;
    try {
      const res = await fetch(`${API_URL}/api/policies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPolicies((prev) => prev.filter((p) => p._id !== id));
        toast.success("Policy removed");
      } else {
        const data = await res.json();
        toast.error(data.error || "Delete failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const renewPolicy = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/policies/${id}/renew`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Renewed successfully!");
        // Optimistic update or re-fetch
        setPolicies((prev) =>
          prev.map((p) => (p._id === id ? data.policy : p))
        );
      } else {
        toast.error(data.error || "Renewal failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // IMPORTANT: Re-fetch data after adding to ensure sync
  const handlePolicyAdded = async () => {
    await fetchAllData();
    toast.success("Dashboard updated");
  };

  const activeCount = policies.filter((p) => p.status === "active").length;
  const dueSoonCount = policies.filter(
    (p) => p.status === "active" && daysLeft(p.endDate) <= 15
  ).length;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium' }} />

      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-gray-200 shadow-sm z-20">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Insura<span className="text-indigo-600">AI</span>
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active />
          <SidebarItem icon={<PieChart size={20} />} label="Analytics" />
          <SidebarItem icon={<FileText size={20} />} label="Documents" />
          <SidebarItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group relative">
            <img 
              src={user.avatar || getAvatarUrl(user.name)} 
              alt="User" 
              className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-white"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            
            {/* Logout Button (Appears on hover) */}
            <button 
              onClick={logout}
              className="absolute inset-0 bg-red-50/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-red-600 font-medium gap-2 shadow-inner"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Patterns */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent" />
        </div>

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
           <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
           
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setShowForm(true)}
               className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
             >
               <Plus size={18} />
               Add New Policy
             </button>
             
             {/* Mobile Add Button */}
             <button 
               onClick={() => setShowForm(true)}
               className="md:hidden flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full shadow-lg"
             >
               <Plus size={20} />
             </button>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 z-0">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <StatCard 
                label="Total Policies" 
                value={policies.length} 
                icon={<FileText className="text-indigo-600" />} 
                trend="+2 this month"
              />
              <StatCard 
                label="Active Coverage" 
                value={activeCount} 
                icon={<ShieldCheck className="text-emerald-600" />} 
                trend="100% secured"
                trendColor="text-emerald-600"
              />
              <StatCard 
                label="Renewals Due" 
                value={dueSoonCount} 
                icon={<AlertCircle className="text-amber-600" />} 
                trend="Within 15 days"
                trendColor="text-amber-600"
                highlight={dueSoonCount > 0}
              />
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
               {/* Search */}
               <div className="relative w-full md:w-72">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <input 
                   type="text" 
                   placeholder="Search policies..." 
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   className="w-full pl-9 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg text-sm transition-all"
                 />
               </div>

               {/* Filter Tabs */}
               <div className="flex items-center bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto no-scrollbar">
                 {["all", "active", "expired", "pending"].map((status) => (
                   <button
                     key={status}
                     onClick={() => setStatusFilter(status)}
                     className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                       statusFilter === status 
                         ? "bg-white text-indigo-600 shadow-sm" 
                         : "text-gray-500 hover:text-gray-700"
                     }`}
                   >
                     {status.charAt(0).toUpperCase() + status.slice(1)}
                   </button>
                 ))}
               </div>

               {/* Sort Dropdown */}
               <div className="relative w-full md:w-auto">
                 <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-indigo-300">
                   <Filter className="w-4 h-4" />
                   <select 
                     value={sortKey} 
                     onChange={(e) => setSortKey(e.target.value)}
                     className="bg-transparent border-none focus:ring-0 p-0 text-sm cursor-pointer w-full md:w-auto"
                   >
                     <option value="endDateAsc">Expiring Soonest</option>
                     <option value="endDateDesc">Expiring Latest</option>
                     <option value="premiumHigh">Highest Premium</option>
                     <option value="premiumLow">Lowest Premium</option>
                   </select>
                 </div>
               </div>
            </div>

            {/* Policy Grid */}
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
                 ))}
               </div>
            ) : filteredSorted.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <ShieldCheck className="w-8 h-8 text-gray-300" />
                 </div>
                 <h3 className="text-lg font-medium text-gray-900">No policies found</h3>
                 <p className="text-gray-500 text-sm">Try adjusting your filters or add a new policy.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 <AnimatePresence>
                   {filteredSorted.map((policy) => (
                     <PolicyCard 
                       key={policy._id} 
                       policy={policy} 
                       daysLeft={daysLeft(policy.endDate)}
                       onRenew={renewPolicy}
                       onDelete={deletePolicy}
                     />
                   ))}
                 </AnimatePresence>
               </div>
            )}

            {/* Mobile User Logout */}
            <div className="md:hidden mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <img src={user.avatar || getAvatarUrl(user.name)} className="w-10 h-10 rounded-full" alt="" />
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 text-red-600 border border-red-200 rounded-xl bg-red-50">
                <LogOut size={16} /> Log Out
              </button>
            </div>

          </div>
        </div>
      </main>

      {showForm && (
        <AddPolicyModal
          token={localStorage.getItem("token")}
          onClose={() => setShowForm(false)}
          onSave={handlePolicyAdded}
        />
      )}
    </div>
  );
}

// --- Sub-Components ---
function SidebarItem({ icon, label, active }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
      active 
        ? "bg-indigo-50 text-indigo-700 font-medium" 
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`}>
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon, trend, trendColor = "text-gray-500", highlight }) {
  return (
    <div className={`bg-white p-5 rounded-xl border ${highlight ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'} shadow-sm`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg ${highlight ? 'bg-amber-100' : 'bg-gray-50'}`}>
          {icon}
        </div>
      </div>
      <p className={`text-xs font-medium ${trendColor}`}>{trend}</p>
    </div>
  );
}

function PolicyCard({ policy, daysLeft, onRenew, onDelete }) {
  const isExpiringSoon = policy.status === 'active' && daysLeft <= 30;
  const isExpired = daysLeft < 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col"
    >
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <ShieldCheck size={20} />
          </div>
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wide ${
            policy.status === 'active' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {policy.status}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{policy.type}</h3>
        <p className="text-xs text-gray-400 font-mono">{policy.policyNumber}</p>
      </div>

      {/* Data Points */}
      <div className="px-5 py-3 bg-gray-50/50 border-y border-gray-100 grid grid-cols-2 gap-y-3 gap-x-4">
        <div>
          <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Premium</p>
          <p className="text-sm font-semibold text-gray-900">₹{policy.premiumAmount?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Sum Insured</p>
          <p className="text-sm font-semibold text-gray-900">₹{policy.sumInsured?.toLocaleString()}</p>
        </div>
        <div className="col-span-2">
           <div className="flex justify-between items-center">
             <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Expires On</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(policy.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
             </div>
             <div className={`text-right ${isExpiringSoon ? 'text-amber-600' : isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                <p className="text-xs font-bold">
                  {isExpired ? 'Expired' : `${daysLeft} Days left`}
                </p>
             </div>
           </div>
           {/* Progress Bar */}
           {!isExpired && (
             <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
               <div 
                 className={`h-full rounded-full ${isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                 style={{ width: `${Math.max(0, Math.min(100, (daysLeft / 365) * 100))}%` }}
               />
             </div>
           )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 mt-auto flex gap-2">
        {policy.fileUrl && (
          <a 
            href={policy.fileUrl} 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <FileText size={14} /> Doc
          </a>
        )}
        <button 
          onClick={() => onRenew(policy._id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} /> Renew
        </button>
        <button 
          onClick={() => onDelete(policy._id)}
          className="flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete Policy"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}