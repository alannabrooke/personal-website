import { ExternalLink, Globe } from "lucide-react";
import { LinkedInIcon } from "@/components/desktop/icons";
import { linkedinLink, profile } from "@/data/content";

const profileAddress = linkedinLink.href.replace("https://www.", "");

export function LinkedInBrowser() {
  return (
    <div className="flex h-full flex-col bg-[#f4f6f8]">
      <div data-drag-region className="shrink-0 border-b border-black/10 bg-[#f6f7f9] px-4 pb-3 pt-2">
        <div className="mx-auto flex max-w-[400px] items-center justify-center gap-2 rounded-md bg-[#e9edf1] px-3 py-1.5 text-xs text-[#465565]">
          <Globe aria-hidden="true" className="size-3 shrink-0" />
          <span data-no-drag className="min-w-0 select-text truncate">{profileAddress}</span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="m-auto w-full max-w-[500px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
          <div aria-hidden="true" className="h-16 bg-linear-to-br from-[#e7f3fd] to-[#bcdcf3]" />
          <div className="relative px-5 pb-5 sm:px-6">
            <div aria-hidden="true" className="-mt-7 mb-2 size-14 rounded-[14px] bg-white p-1 ring-1 ring-black/5">
              <LinkedInIcon />
            </div>
            <p className="text-xs font-medium text-[#526170]">LinkedIn profile preview</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{profile.name}</h2>
            <p className="mt-1.5 text-sm text-[#465565]">Design and development · Agency Accolade</p>
            <a
              href={linkedinLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0a66c2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004182] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a66c2]"
            >
              View full profile
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
