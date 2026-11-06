"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** A 52px window toolbar. Drag the window by it; leaves room for the traffic lights when `inset`. */
export function Toolbar({
  children,
  className,
  inset = false,
}: {
  children?: ReactNode;
  className?: string;
  inset?: boolean;
}) {
  return (
    <div
      data-drag-region
      className={cx("flex h-[52px] shrink-0 items-center gap-1.5 px-3", inset && "pl-[84px]", className)}
    >
      {children}
    </div>
  );
}

export function ToolButton({
  label,
  children,
  onClick,
  disabled,
  pressed,
  className,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "flex h-7 min-w-7 items-center justify-center gap-1 rounded-md px-1.5 text-black/55",
        "enabled:hover:bg-black/[0.06] disabled:text-black/20",
        pressed && "bg-black/[0.08] text-black/75",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SidebarHeading({ children }: { children: ReactNode }) {
  return <div className="px-2.5 pb-1 pt-3 text-[11px] font-semibold text-black/40">{children}</div>;
}

export function SidebarItem({
  icon,
  children,
  selected,
  onClick,
}: {
  icon: ReactNode;
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex h-7 w-full items-center gap-2 rounded-md px-2.5 text-left text-[13px] text-black/85",
        selected ? "bg-black/[0.09]" : "hover:bg-black/[0.04]",
      )}
    >
      <span className="flex w-4 justify-center text-[#2f6ee6]">{icon}</span>
      <span className="truncate">{children}</span>
    </button>
  );
}
