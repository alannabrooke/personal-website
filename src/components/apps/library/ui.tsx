import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

export const field = "app-ref-field w-full rounded-md px-2.5 py-1 placeholder:text-[#667487]";
export const label = "grid gap-1.5 text-xs font-semibold";

export function LibraryFrame({ title, controls, children, className }: { title?: string; controls?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx("app-ref @container flex h-full min-h-0 flex-col", className)}>
      {(title || controls) && (
        <div data-drag-region className="app-ref-toolbar">
          {title && <span className="app-ref-toolbar-title mr-2">{title}</span>}
          {controls}
        </div>
      )}
      {children}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("app-ref-panel rounded-lg p-4", className)}>{children}</div>;
}

export function SourceRail({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <aside aria-label={label} className={cx("app-ref-rail flex max-h-36 shrink-0 flex-wrap content-start gap-1 overflow-auto border-b p-2 @min-[530px]:max-h-none @min-[530px]:w-45 @min-[530px]:flex-col @min-[530px]:flex-nowrap @min-[530px]:border-r @min-[530px]:border-b-0", className)}>
      {children}
    </aside>
  );
}

export function SourceHeading({ children }: { children: ReactNode }) {
  return <span className="app-ref-rail-title hidden @min-[530px]:block">{children}</span>;
}

export function SourceItem({ selected, icon, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; icon?: ReactNode }) {
  return (
    <button type="button" {...props} aria-pressed={selected}
      className={cx("app-ref-row w-auto @min-[530px]:w-full", className)}>
      {icon}
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}

export function Action({ primary = false, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      data-primary={primary}
      className={cx("app-ref-action", className)}
    />
  );
}

export const externalAction = "app-ref-action app-ref-external";

export function Empty({ children }: { children: ReactNode }) {
  return <p className="app-ref-empty px-5 py-4">{children}</p>;
}

export function downloadFile(file: Blob, filename: string) {
  const href = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
