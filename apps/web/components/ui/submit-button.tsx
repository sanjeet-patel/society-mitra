"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

export function SubmitButton({
  pending,
  pendingLabel,
  children,
  ...props
}: ComponentProps<typeof Button> & {
  pending?: boolean;
  pendingLabel?: string;
}) {
  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {pendingLabel ?? "Please wait…"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
