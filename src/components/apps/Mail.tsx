"use client";

import { Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { profile } from "@/data/content";
import { ToolButton, Toolbar } from "./ui";

export function MailApp() {
  const { isMobile } = useDesktop();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const send = () => {
    const params = new URLSearchParams({ subject: subject || "Hello!", body });
    // URLSearchParams encodes spaces as "+", which mail clients show literally.
    window.location.href = `mailto:${profile.email}?${params.toString().replace(/\+/g, "%20")}`;
  };

  return (
    <form
      className="flex h-full flex-col bg-white"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <Toolbar inset className="border-b border-black/10">
        <button
          type="submit"
          aria-label="Send"
          title="Send"
          className="flex h-7 items-center rounded-md px-2 text-[#2f6ee6] hover:bg-black/[0.06]"
        >
          <Send className="size-[18px]" />
        </button>
        <div className="flex-1 text-center text-[13px] font-semibold text-black/70 max-sm:hidden">
          {subject || "New Message"}
        </div>
        {!isMobile && (
          <ToolButton label="Attach (disabled)" disabled>
            <Paperclip className="size-4" />
          </ToolButton>
        )}
      </Toolbar>

      <Field label="To:">
        <span className="rounded-full bg-[#2f6ee6]/10 px-2 py-0.5 text-[13px] text-[#2f6ee6]">
          {profile.name} &lt;{profile.email}&gt;
        </span>
      </Field>
      <Field label="Subject:">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-transparent text-[13px] outline-none"
          placeholder="Let's work together"
        />
      </Field>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Hi ${profile.name.split(" ")[0]},\n\n`}
        className="min-h-0 flex-1 resize-none bg-transparent px-5 py-4 text-[14px] leading-relaxed outline-none placeholder:text-black/30"
      />
      <p className="shrink-0 border-t border-black/5 px-5 py-2 text-[11px] text-black/40">
        Pressing send opens this message in your own email app.
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mx-5 flex h-9 shrink-0 items-center gap-2 border-b border-black/10">
      <span className="text-[13px] text-black/45">{label}</span>
      {children}
    </label>
  );
}
