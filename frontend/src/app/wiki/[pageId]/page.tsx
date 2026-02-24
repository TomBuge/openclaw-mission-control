"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Edit3, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/auth/clerk";

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}

export default function WikiPageView() {
  const { pageId } = useParams<{ pageId: string }>();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [page, setPage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const token = typeof window !== "undefined" ? sessionStorage.getItem("mc_local_auth_token") : null;

  const fetchPage = useCallback(async () => {
    if (!token || !pageId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/wiki/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPage(data);
        setEditContent(data.content);
        setEditTitle(data.title);
      }
    } finally {
      setLoading(false);
    }
  }, [token, pageId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSave = async () => {
    if (!token || !page) return;
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/wiki/${page.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPage(updated);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !page) return;
    setDeleting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/wiki/${page.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/wiki");
    } finally {
      setDeleting(false);
    }
  };

  if (!isSignedIn) return null;
  if (loading) return <div className="p-6 text-center text-sm text-slate-500">Loading...</div>;
  if (!page) return <div className="p-6 text-center text-sm text-slate-500">Page not found</div>;

  // Simple markdown-ish rendering (headers, bold, links, lists)
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-semibold mt-4 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold mt-5 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold mt-6 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 list-disc text-sm text-slate-700">{line.slice(2)}</li>;
      if (line.trim() === "") return <br key={i} />;
      // Bold
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} className="text-sm text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/wiki")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Wiki
        </button>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setEditing(false); setEditContent(page.content); setEditTitle(page.title); }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800 mb-3">Delete &ldquo;{page.title}&rdquo;? This can&apos;t be undone.</p>
          <div className="flex gap-2">
            <button onClick={handleDelete} disabled={deleting} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50">
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          {editing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-xl font-bold text-slate-900 border-none outline-none bg-transparent"
            />
          ) : (
            <h1 className="text-xl font-bold text-slate-900">{page.title}</h1>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {page.author_name && `Last edited by ${page.author_name} · `}
            {new Date(page.updated_at).toLocaleString()}
          </p>
        </div>
        <div className="px-6 py-5">
          {editing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[500px] rounded-lg border border-slate-200 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your content in markdown..."
            />
          ) : page.content ? (
            <div className="prose prose-sm max-w-none">{renderContent(page.content)}</div>
          ) : (
            <p className="text-sm text-slate-400 italic">No content yet. Click Edit to start writing.</p>
          )}
        </div>
      </div>
    </div>
  );
}
