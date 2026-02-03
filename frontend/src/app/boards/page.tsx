"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { Button } from "@/components/ui/button";

type Board = {
  id: string;
  name: string;
  slug: string;
};

const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

export default function BoardsPage() {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedBoards = useMemo(
    () => [...boards].sort((a, b) => a.name.localeCompare(b.name)),
    [boards]
  );

  const loadBoards = async () => {
    if (!isSignedIn) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/v1/boards`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        throw new Error("Unable to load boards.");
      }
      const data = (await response.json()) as Board[];
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const columns = useMemo<ColumnDef<Board>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Board",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">{row.original.name}</p>
            <p className="text-xs text-gray-500">{row.original.slug}</p>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div
            className="flex items-center justify-end"
            onClick={(event) => event.stopPropagation()}
          >
            <Link
              href={`/boards/${row.original.id}`}
              className="inline-flex h-8 items-center justify-center rounded-lg border-2 border-gray-200 px-3 text-xs font-medium text-gray-700"
            >
              Open
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: sortedBoards,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DashboardShell>
      <SignedOut>
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-gray-200 bg-white p-10 text-center shadow-lush lg:col-span-2">
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
        <div className="flex h-full flex-col gap-4 rounded-xl border-2 border-gray-200 bg-white p-8 shadow-lush">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Boards</h2>
              <p className="text-sm text-gray-500">
                {sortedBoards.length} board
                {sortedBoards.length === 1 ? "" : "s"} total.
              </p>
            </div>
            <Button
              className="border-2 border-gray-900 bg-gray-900 text-white"
              onClick={() => router.push("/boards/new")}
            >
              New board
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              {error}
            </div>
          )}

          {sortedBoards.length === 0 && !isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              No boards yet. Create your first board to get started.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/boards/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 align-top">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SignedIn>
    </DashboardShell>
  );
}
