"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CredentialSlip({
  societyName,
  mobile,
  password,
  fullName,
  onClose,
}: {
  societyName: string;
  mobile: string;
  password: string;
  fullName: string;
  onClose?: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Credential Slip - ${fullName}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; max-width: 400px; margin: 0 auto; }
        h1 { font-size: 18px; margin-bottom: 8px; }
        .field { margin: 12px 0; }
        .label { font-size: 12px; color: #666; text-transform: uppercase; }
        .value { font-size: 16px; font-weight: 600; }
        .note { margin-top: 24px; font-size: 12px; color: #666; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Credential slip — share offline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={printRef}>
          <h1 className="font-bold text-lg">{societyName}</h1>
          <p className="text-sm text-muted-foreground mb-4">Society Mitra login credentials</p>
          <div className="field">
            <div className="label text-xs text-muted-foreground uppercase">Name</div>
            <div className="value font-semibold">{fullName}</div>
          </div>
          <div className="field">
            <div className="label text-xs text-muted-foreground uppercase">Mobile (Login ID)</div>
            <div className="value font-semibold">{mobile}</div>
          </div>
          <div className="field">
            <div className="label text-xs text-muted-foreground uppercase">Temporary password</div>
            <div className="value font-semibold">{password}</div>
          </div>
          <p className="note text-xs text-muted-foreground mt-4">
            Sign in at societymitra.info/login and change your password under Profile.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handlePrint}>
            Print slip
          </Button>
          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
