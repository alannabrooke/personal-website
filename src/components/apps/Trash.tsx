"use client";

import { StickyNote } from "lucide-react";
import { useState } from "react";
import { TrashIcon } from "@/components/desktop/icons";
import { emptyPersonalTrash, updatePersonalNote, usePersonalNotes } from "@/components/desktop/personalNotes";
import { Toolbar } from "./ui";

export function Trash() {
  const deleted = usePersonalNotes().filter((note) => note.deleted);
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  return (
    <div className="flex h-full flex-col bg-[#fbfcfe]">
      <Toolbar inset className="border-b border-[#d8deea] bg-[#f1f4fa]">
        <h2 className="mr-auto text-[15px] font-semibold text-[#263449]">Trash</h2>
        {deleted.length > 0 && (
          <button type="button" onClick={() => setConfirmEmpty(true)} className="rounded-md border border-[#d8deea] bg-white px-2.5 py-1 text-[12px] shadow-sm hover:bg-[#f5f7fb]">
            Empty Trash
          </button>
        )}
      </Toolbar>
      {confirmEmpty && deleted.length > 0 && (
        <div role="alert" className="flex flex-wrap items-center gap-2 border-b border-[#e9c4ba] bg-[#fff1ec] px-4 py-3 text-[13px]">
          <p className="mr-auto">Permanently delete the notes in Trash?</p>
          <button type="button" onClick={() => setConfirmEmpty(false)} className="rounded-md bg-white px-2.5 py-1.5">Cancel</button>
          <button type="button" onClick={() => { emptyPersonalTrash(); setConfirmEmpty(false); }} className="rounded-md bg-[#a5382a] px-2.5 py-1.5 text-white">Delete Permanently</button>
        </div>
      )}
      {deleted.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-[#52627b]">
          <span className="block size-14"><TrashIcon /></span>
          <p className="text-[14px] font-medium">Trash is empty</p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto p-3">
          {deleted.map((note) => (
            <li key={note.id} className="flex items-center gap-2.5 rounded-md px-3 py-2 odd:bg-[#edf2fa]">
              <StickyNote aria-hidden="true" className="size-4 shrink-0 text-[#8a6125]" />
              <span className="min-w-0 flex-1 truncate text-[13px]">{note.title || "Untitled Note"}</span>
              <button type="button" onClick={() => { updatePersonalNote(note.id, { deleted: false }); setConfirmEmpty(false); }} className="shrink-0 rounded-md px-2 py-1 text-[12px] font-medium text-[#275ba9] hover:bg-[#dce7fa]">
                Put Back
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
