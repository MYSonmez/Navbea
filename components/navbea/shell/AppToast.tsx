import { CheckCircle2 } from "lucide-react";

export function AppToast({ message }: { message: string }) {
  return message ? <div className="app-toast" role="status"><CheckCircle2 size={16} />{message}</div> : null;
}
