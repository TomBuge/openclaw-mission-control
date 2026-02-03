"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";

import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { TaskBoard } from "@/components/organisms/TaskBoard";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Board = {
  id: string;
  name: string;
  slug: string;
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_at?: string | null;
};

const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const boardIdParam = params?.boardId;
  const boardId = Array.isArray(boardIdParam) ? boardIdParam[0] : boardIdParam;
  const { getToken, isSignedIn } = useAuth();

  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const titleLabel = useMemo(
    () => (board ? `${board.name} board` : "Board"),
    [board],
  );

  const loadBoard = async () => {
    if (!isSignedIn || !boardId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const [boardResponse, tasksResponse] = await Promise.all([
        fetch(`${apiBase}/api/v1/boards/${boardId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }),
        fetch(`${apiBase}/api/v1/boards/${boardId}/tasks`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }),
      ]);

      if (!boardResponse.ok) {
        throw new Error("Unable to load board.");
      }
      if (!tasksResponse.ok) {
        throw new Error("Unable to load tasks.");
      }

      const boardData = (await boardResponse.json()) as Board;
      const taskData = (await tasksResponse.json()) as Task[];
      setBoard(boardData);
      setTasks(taskData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, isSignedIn]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCreateError(null);
  };

  const handleCreateTask = async () => {
    if (!isSignedIn || !boardId) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setCreateError("Add a task title to continue.");
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/v1/boards/${boardId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title: trimmed,
          description: description.trim() || null,
          status: "inbox",
          priority,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create task.");
      }

      const created = (await response.json()) as Task;
      setTasks((prev) => [created, ...prev]);
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardShell>
      <SignedOut>
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-gray-200 bg-white p-10 text-center shadow-lush">
          <p className="text-sm text-gray-600">Sign in to view boards.</p>
          <SignInButton
            mode="modal"
            afterSignInUrl="/boards"
            afterSignUpUrl="/boards"
            forceRedirectUrl="/boards"
            signUpForceRedirectUrl="/boards"
          >
            <Button className="border-2 border-gray-900 bg-gray-900 text-white">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <DashboardSidebar />
        <div className="flex h-full flex-col gap-6 rounded-xl border-2 border-gray-200 bg-white p-8 shadow-lush">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                {board?.slug ?? "board"}
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">
                {board?.name ?? "Board"}
              </h1>
              <p className="text-sm text-gray-600">
                Keep tasks moving through your workflow.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-2 border-gray-200 text-gray-700"
              onClick={() => router.push("/boards")}
            >
              Back to boards
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
              Loading {titleLabel}…
            </div>
          ) : (
            <TaskBoard
              tasks={tasks}
              onCreateTask={() => setIsDialogOpen(true)}
              isCreateDisabled={isCreating}
            />
          )}
        </div>
      </SignedIn>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsDialogOpen(nextOpen);
          if (!nextOpen) {
            resetForm();
          }
        }}
      >
        <DialogContent aria-label={titleLabel}>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>
              Add a task to the inbox and triage it when you are ready.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Title</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Prepare launch notes"
                className="h-11 rounded-lg border-2 border-gray-200 bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional details"
                className="min-h-[120px] rounded-lg border-2 border-gray-200 bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {createError ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                {createError}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-2 border-gray-200 text-gray-700"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="border-2 border-gray-900 bg-gray-900 text-white"
              onClick={handleCreateTask}
              disabled={isCreating}
            >
              {isCreating ? "Creating…" : "Create task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
