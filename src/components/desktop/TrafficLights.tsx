"use client";

import { cx } from "@/lib/cx";

type Props = {
  active: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onZoom?: () => void;
  className?: string;
};

const INACTIVE = "bg-[#d0cfd1] ring-black/10";

export function TrafficLights({ active, onClose, onMinimize, onZoom, className }: Props) {
  return (
    <div data-no-drag className={cx("group/lights flex items-center gap-2", className)}>
      <Light
        label="Close"
        color="bg-[#ff5f57] ring-[#e0443e]"
        hoverColor="group-hover/lights:bg-[#ff5f57] group-hover/lights:ring-[#e0443e]"
        active={active}
        onClick={onClose}
        glyph={<path d="M3 3 L7 7 M7 3 L3 7" />}
      />
      <Light
        label="Minimize"
        color="bg-[#febc2e] ring-[#dea123]"
        hoverColor="group-hover/lights:bg-[#febc2e] group-hover/lights:ring-[#dea123]"
        active={active}
        onClick={onMinimize}
        glyph={<path d="M2.5 5 H7.5" />}
      />
      <Light
        label="Zoom"
        color="bg-[#28c840] ring-[#1aab29]"
        hoverColor="group-hover/lights:bg-[#28c840] group-hover/lights:ring-[#1aab29]"
        active={active}
        onClick={onZoom}
        glyph={<path d="M3 6.5 V3 H6.5 Z M7 3.5 V7 H3.5 Z" fill="currentColor" stroke="none" />}
      />
    </div>
  );
}

function Light({
  label,
  color,
  hoverColor,
  active,
  onClick,
  glyph,
}: {
  label: string;
  color: string;
  hoverColor: string;
  active: boolean;
  onClick?: () => void;
  glyph: React.ReactNode;
}) {
  const disabled = !onClick;
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cx(
        "flex size-3 items-center justify-center rounded-full ring-[0.5px] ring-inset",
        disabled ? INACTIVE : active ? color : cx(INACTIVE, hoverColor),
        !disabled && "group-hover/lights:[&>svg]:opacity-100",
      )}
    >
      <svg
        viewBox="0 0 10 10"
        className="size-2 text-black/60 opacity-0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        {glyph}
      </svg>
    </button>
  );
}
