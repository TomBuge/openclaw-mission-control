"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/boards/77ac2212-d23f-4405-b395-5459994d1ffa");
  }, [router]);
  return null;
}
