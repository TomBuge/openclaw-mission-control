"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Search, LayoutGrid, List, Shield, FlaskConical, Rocket, DollarSign, File } from "lucide-react";
import { useAuth } from "@/auth/clerk";

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  category: string;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "iso27566", label: "ISO 27566", icon: Shield, color: "bg-blue-500", lightBg: "bg-blue-50", lightText: "text-blue-700", border: "border-blue-200" },
  { value: "iso27001", label: "ISO 27001", icon: Shield, color: "bg-indigo-500", lightBg: "bg-indigo-50", lightText: "text-indigo-700", border: "border-indigo-200" },
  { value: "research", label: "Research", icon: FlaskConical, color: "bg-purple-500", lightBg: "bg-purple-50", lightText: "text-purple-700", border: "border-purple-200" },
  { value: "product", label: "Product", icon: Rocket, color: "bg-emerald-500", lightBg: "bg-emerald-50", lightText: "text-emerald-700", border: "border-emerald-200" },
  { value: "sales", label: "Sales", icon: DollarSign, color: "bg-amber-500", lightBg: "bg-amber-50", lightText: "text-amber-700", border: "border-amber-200" },
  { value: "regulatory", label: "Regulatory", icon: Shield, color: "bg-cyan-500", lightBg: "bg-cyan-50", lightText: "text-cyan-700", border: "border-cyan-200" },
  { value: "general", label: "General", icon: File, color: "bg-slate-500", lightBg: "bg-slate-50", lightText: "text-slate-700", border: "border-slate-200" },
];

function getCat(cat: string) {
  return CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[CATEGORIES.length - 1];
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function WikiPageList() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [creating, setCreating] = useState(false);

  const token = typeof window !== "undefined" ? sessionStorage.getItem("mc_local_auth_token") : null;

  const fetchPages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/wiki`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPages(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !token) return;
    setCreating(true);
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/wiki`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, slug, category: newCategory }),
      });
      if (res.ok) {
        const page = await res.json();
        router.push(`/wiki/${page.id}`);
      }
    } finally { setCreating(false); }
  };

  const filtered = pages.filter((p) => {
    if (filterCat && p.category !== filterCat) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Category counts
  const catCounts = CATEGORIES.map((c) => ({
    ...c,
    count: pages.filter((p) => p.category === c.value).length,
  })).filter((c) => c.count > 0);

  if (!isSignedIn) return null;

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wiki</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pages.length} pages across {catCounts.length} categories</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Page
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Page title..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
            <button onClick={handleCreate} disabled={creating || !newTitle.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Category pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setFilterCat(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${!filterCat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          All ({pages.length})
        </button>
        {catCounts.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.value} onClick={() => setFilterCat(filterCat === c.value ? null : c.value)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${filterCat === c.value ? `${c.lightBg} ${c.lightText} ring-1 ${c.border}` : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <Icon className="h-3 w-3" /> {c.label} ({c.count})
            </button>
          );
        })}
      </div>

      {/* Search + view toggle */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button onClick={() => setViewMode("grid")}
            className={`p-2 transition ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode("list")}
            className={`p-2 transition ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center text-sm text-slate-500 py-16">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-16">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm">{search ? "No pages match your search." : "No pages yet."}</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((page) => {
            const cat = getCat(page.category);
            const Icon = cat.icon;
            return (
              <div key={page.id} onClick={() => router.push(`/wiki/${page.id}`)}
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${cat.lightBg}`}>
                    <Icon className={`h-4.5 w-4.5 ${cat.lightText}`} />
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${cat.lightBg} ${cat.lightText}`}>
                    {cat.label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition line-clamp-2 mb-2">
                  {page.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{page.author_name || "—"}</span>
                  <span>{timeAgo(page.updated_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-40">Category</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-32">Author</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-32">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page) => {
                const cat = getCat(page.category);
                const Icon = cat.icon;
                return (
                  <tr key={page.id} onClick={() => router.push(`/wiki/${page.id}`)}
                    className="border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-800 hover:text-blue-600">{page.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cat.lightBg} ${cat.lightText}`}>
                        <Icon className="h-3 w-3" /> {cat.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{page.author_name || "—"}</td>
                    <td className="py-3 px-4 text-right text-slate-400 text-xs">{timeAgo(page.updated_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
