import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, "default" | "outline" | "ember"> = {
  inbox: "outline",
  assigned: "default",
  in_progress: "ember",
  testing: "outline",
  review: "default",
  done: "default",
  online: "default",
  busy: "ember",
  offline: "outline",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_STYLES[status] ?? "default"}>
      {status.replace("_", " ")}
    </Badge>
  );
}
