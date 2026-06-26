import { cn } from "@/lib/utils";

export const MEMBER_ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "tenant", label: "Tenant" },
  { value: "vendor", label: "Vendor" },
  { value: "block_admin", label: "Block admin" },
  { value: "society_admin", label: "Society admin" },
] as const;

export function MemberRoleSelect({
  name,
  value,
  onChange,
  className,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      {MEMBER_ROLE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
