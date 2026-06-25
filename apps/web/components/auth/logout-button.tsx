import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton({
  showLabel = true,
  variant = "ghost" as const,
  size = "sm" as const,
  className,
}: {
  showLabel?: boolean;
  variant?: "ghost" | "outline" | "secondary";
  size?: "sm" | "default";
  className?: string;
}) {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant={variant}
        size={size}
        className={className}
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
        {showLabel && <span>Log out</span>}
      </Button>
    </form>
  );
}
