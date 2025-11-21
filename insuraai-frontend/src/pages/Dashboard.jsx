import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  PlusCircle,
  Trash2,
  RefreshCw,
  LogOut,
  Search,
  Filter,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import AddPolicyModal from "../components/AddPolicyModal";
const API = process.env.REACT_APP_API_URL;
export default function Dashboard() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("endDateAsc");

  const token = localStorage.getItem("token");

  // Fetch policies
  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setPolicies(data);
      else toast.error(data.error || "Failed to load policies");
    } catch (err) {
      toast.error("Network error while fetching policies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Helpers
  const daysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredSorted = useMemo(() => {
    let list = [...policies];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.policyNumber?.toLowerCase().includes(q) ||
          p.type?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);

    const byEnd = (a, b) => new Date(a.endDate) - new Date(b.endDate);
    const byEndDesc = (a, b) => new Date(b.endDate) - new Date(a.endDate);
    const byPremiumHigh = (a, b) => (b.premiumAmount || 0) - (a.premiumAmount || 0);
    const byPremiumLow = (a, b) => (a.premiumAmount || 0) - (b.premiumAmount || 0);

    switch (sortKey) {
      case "endDateAsc":
        list.sort(byEnd);
        break;
      case "endDateDesc":
        list.sort(byEndDesc);
        break;
      case "premiumHigh":
        list.sort(byPremiumHigh);
        break;
      case "premiumLow":
        list.sort(byPremiumLow);
        break;
      default:
        break;
    }

    return list;
  }, [policies, query, statusFilter, sortKey]);

  // Actions
  const deletePolicy = async (id) => {
    const ok = window.confirm("Delete this policy permanently?");
    if (!ok) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/policies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPolicies((prev) => prev.filter((p) => p._id !== id));
        toast.success("Policy deleted");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete policy");
      }
    } catch {
      toast.error("Network error while deleting");
    }
  };

  const renewPolicy = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/policies/${id}/renew`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Policy renewed");
        setPolicies((prev) =>
          prev.map((p) => (p._id === id ? data.policy : p))
        );
      } else {
        toast.error(data.error || "Failed to renew");
      }
    } catch {
      toast.error("Network error while renewing");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handlePolicyAdded = (createdPolicy) => {
    setPolicies((prev) => [...prev, createdPolicy]);
    toast.success("Policy added successfully");
  };

  const activeCount = policies.filter((p) => p.status === "active").length;
  const dueSoonCount = policies.filter(
    (p) => p.status === "active" && daysLeft(p.endDate) <= 15
  ).length;

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#205295] overflow-hidden text-slate-50">
      {/* Floating background shapes */}
      <motion.div
        animate={{ opacity: [0.2, 0.3, 0.2], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-[-100px] left-[-120px] w-[400px] h-[400px] bg-[#144272] rounded-full blur-3xl opacity-30"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.3, 0.2], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-[-150px] right-[-120px] w-[500px] h-[500px] bg-[#205295] rounded-full blur-3xl opacity-30"
      />

      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 flex-col shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#78c6ff]" />
            <h1 className="text-xl font-bold text-[#dbefff]">InsuraAI</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 text-sm">
          <div className="mb-2 px-3 py-2 rounded-lg bg-white/6 text-[#cdeaff] font-medium">
            Dashboard
          </div>
          <div className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
            Analytics
          </div>
          <div className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
            Settings
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 border border-red-500/40 rounded-lg hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 relative z-10">
        <header className="sticky top-0 bg-white/3 backdrop-blur border-b border-white/10 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-[#e6f7ff]">
              My Policies
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-200" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-lg border w-72 focus:outline-none focus:ring-2 focus:ring-[#78c6ff] bg-white/5 text-slate-100 placeholder-slate-300"
                  placeholder="Search by policy # or type"
                />
              </div>

              <div className="flex rounded-lg border border-white/10 overflow-hidden">
                {["all", "active", "expired", "pending"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-2 text-sm capitalize ${
                      statusFilter === s
                        ? "bg-[#144272] text-white"
                        : "bg-transparent hover:bg-white/5"
                    } ${s !== "pending" ? "border-r border-white/5" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-200" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78c6ff] bg-white/5 text-slate-100"
                >
                  <option value="endDateAsc">End date ↑</option>
                  <option value="endDateDesc">End date ↓</option>
                  <option value="premiumHigh">Premium high → low</option>
                  <option value="premiumLow">Premium low → high</option>
                </select>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#144272] text-white rounded-lg shadow hover:bg-[#0f3c63] transition"
              >
                <PlusCircle className="w-5 h-5" /> Add Policy
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Policies"
              value={policies.length}
              icon={<ShieldCheck className="w-5 h-5" />}
              gradient="from-[#78c6ff] to-[#4fc3ff]"
            />
            <StatCard
              title="Active"
              value={activeCount}
              icon={<CalendarClock className="w-5 h-5" />}
              gradient="from-emerald-400 to-teal-500"
            />
            <StatCard
              title="Due Soon (≤15d)"
              value={dueSoonCount}
              icon={<AlertTriangle className="w-5 h-5" />}
              gradient="from-amber-500 to-orange-500"
            />
          </div>

          {loading ? (
            <SkeletonGrid />
          ) : filteredSorted.length === 0 ? (
            <EmptyState onAdd={() => setShowForm(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSorted.map((policy) => {
                const left = daysLeft(policy.endDate);
                const dueSoon = policy.status === "active" && left <= 15;
                return (
                  <motion.div
                    key={policy._id}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border shadow-md bg-white/6 backdrop-blur-lg p-5 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#e6f7ff]">
                          {policy.policyNumber}
                        </h3>
                        <p className="text-sm text-slate-200">{policy.type}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          policy.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : policy.status === "expired"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {policy.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <InfoRow label="Premium" value={`₹${policy.premiumAmount ?? "-"}`} />
                      <InfoRow label="Sum Insured" value={`₹${policy.sumInsured ?? "-"}`} />
                      <InfoRow label="Deductible" value={`₹${policy.deductible ?? "-"}`} />
                      <InfoRow
                        label="Start"
                        value={new Date(policy.startDate).toLocaleDateString()}
                      />
                      <InfoRow
                        label="End"
                        value={new Date(policy.endDate).toLocaleDateString()}
                      />
                      {typeof left === "number" && (
                        <InfoRow
                          label="Days Left"
                          value={
                            <span
                              className={`px-2 py-0.5 rounded ${
                                dueSoon
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {left >= 0 ? `${left} days` : "Expired"}
                            </span>
                          }
                        />
                      )}
                    </div>

                    {/* Actions Section */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {/* View Document Button */}
                      {policy.fileUrl && (
                        <a
                          href={policy.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-white/20 text-[#dbefff] hover:bg-white/6 transition"
                        >
                          📄 View Document
                        </a>
                      )}
                      <button
                        onClick={() => renewPolicy(policy._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-white/10 text-slate-200 hover:bg-white/6 transition"
                      >
                        <RefreshCw className="w-4 h-4" /> Renew
                      </button>
                      <button
                        onClick={() => deletePolicy(policy._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-white/10 text-slate-200 hover:bg-white/6 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        {/* 👇 Mobile Logout Button (shown only on small screens) */}
        <div className="md:hidden mt-10 flex justify-center pb-10">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-400 border border-red-400 rounded-lg hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </main>

      {showForm && (
        <AddPolicyModal
          token={token}
          onClose={() => setShowForm(false)}
          onSave={handlePolicyAdded}
        />
      )}
    </div>
  );
}

/* ---------- Small Components ---------- */

function StatCard({ title, value, icon, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl border bg-white/6 shadow-md"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-200">{title}</p>
          <div className="p-2 rounded-lg bg-white/8 shadow">{icon}</div>
        </div>
        <p className="mt-2 text-3xl font-bold text-[#e6f7ff]">{value}</p>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-300">{label}</span>
      <span className="font-medium text-slate-100">{value}</span>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-white/6 p-5 animate-pulse">
          <div className="h-4 w-40 bg-white/8 rounded" />
          <div className="mt-2 h-3 w-24 bg-white/8 rounded" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((__, j) => (
              <div key={j} className="h-3 bg-white/8 rounded" />
            ))}
          </div>
          <div className="mt-5 h-9 bg-white/8 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="border rounded-2xl p-10 bg-white/6 backdrop-blur-lg text-center shadow-md">
      <div className="mx-auto w-14 h-14 rounded-full bg-white/8 flex items-center justify-center mb-3">
        <ShieldCheck className="text-[#78c6ff]" />
      </div>
      <h3 className="text-lg font-semibold text-[#e6f7ff]">No policies yet</h3>
      <p className="text-slate-300 mt-1">
        Get started by adding your first policy via manual entry or AI scan.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#144272] text-white rounded-lg hover:bg-[#0f3c63] transition"
      >
        <PlusCircle className="w-4 h-4" /> Add Policy
      </button>
    </div>
  );
}
