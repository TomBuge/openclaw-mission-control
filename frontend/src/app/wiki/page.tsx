"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Folder, Search, Trash2, Edit3 } from "lucide-react";
import { useAuth } from "@/auth/clerk";

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  category: string;
  author_name: string | null;
  created_at: string;
  updated_at: string;
  content?: string;
}

const CATEGORIES = [
  { value: "regulatory", label: "📋 Regulatory & Compliance", color: "bg-blue-100 text-blue-700" },
  { value: "research", label: "🔬 Research", color: "bg-purple-100 text-purple-700" },
  { value: "product", label: "🚀 Product", color: "bg-green-100 text-green-700" },
  { value: "sales", label: "💰 Sales", color: "bg-amber-100 text-amber-700" },
  { value: "general", label: "📄 General", color: "bg-slate-100 text-slate-700" },
];

function categoryStyle(cat: string) {
  return CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[CATEGORIES.length - 1];
}

export default function WikiPageList() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [creating, setCreating] = useState(false);

  const token = typeof window !== "undefined" ? sessionStorage.getItem("mc_auth_token") : null;

  const fetchPages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/wiki`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPages(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

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
    } finally {
      setCreating(false);
    }
  };

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    pages: filtered.filter((p) => p.category === cat.value),
  })).filter((g) => g.pages.length > 0);

  if (!isSignedIn) return null;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wiki</h1>
          <p className="text-sm text-slate-500">Internal documentation and knowledge base</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Page
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Page title..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={creating || !newTitle.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pages..."
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center text-sm text-slate-500 py-12">Loading...</div>
      ) : grouped.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm">No pages yet. Create your first page to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.value}>
              <div className="flex items-center gap-2 mb-2">
                <Folder className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-600">{group.label}</h2>
                <span className="text-xs text-slate-400">({group.pages.length})</span>
              </div>
              <div className="space-y-1">
                {group.pages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => router.push(`/wiki/${page.id}`)}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-3 cursor-pointer hover:border-slate-300 hover:shadow-sm transition group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{page.title}</p>
                        <p className="text-xs text-slate-400">
                          {page.author_name && `by ${page.author_name} · `}
                          {new Date(page.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${group.color}`}>
                      {group.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
