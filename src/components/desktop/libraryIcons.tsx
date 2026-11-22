import type { ReactNode } from "react";
import { customIcons } from "@/data/content";
import type { LibraryAppId } from "./appCatalog";
import { useNowSeconds } from "./hooks";
import { DockIcon } from "./icons";

type LibraryIconId = LibraryAppId | "launchpad";
type Tile = { top: string; bottom: string; art: ReactNode };

function CalendarDate() {
  const seconds = useNowSeconds();
  const date = seconds === null ? null : new Date(seconds * 1000);
  return <>
    <path d="M0 0h64v17H0z" fill="#f45b66" />
    <text x="32" y="13" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="white">{date?.toLocaleDateString("en", { weekday: "short" }).toUpperCase()}</text>
    <text x="32" y="48" textAnchor="middle" fontSize="28" fontWeight="650" fill="#242934">{date?.getDate()}</text>
  </>;
}

function ClockHands() {
  const seconds = useNowSeconds();
  const date = seconds === null ? null : new Date(seconds * 1000);
  const hour = ((date?.getHours() ?? 10) % 12) * 30 + (date?.getMinutes() ?? 0) * 0.5;
  const minute = (date?.getMinutes() ?? 8) * 6;
  return <>
    <circle cx="32" cy="32" r="24" fill="#fbfbfd" />
    {Array.from({ length: 12 }, (_, index) => <path key={index} d={index % 3 === 0 ? "M32 11v4" : "M32 11v2"} transform={`rotate(${index * 30} 32 32)`} stroke="#3e4756" strokeWidth="1.5" strokeLinecap="round" />)}
    <path d="M32 33V20" transform={`rotate(${hour} 32 32)`} stroke="#152032" strokeWidth="2.7" strokeLinecap="round" />
    <path d="M32 34V15" transform={`rotate(${minute} 32 32)`} stroke="#152032" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="32" cy="32" r="2" fill="#f07845" />
  </>;
}

const tiles: Record<LibraryIconId, Tile> = {
  launchpad: { top: "#f3f6ff", bottom: "#9faed1", art: <>
    {["#66a5f7", "#86ceaa", "#9478e8", "#f6bb69", "#737eea", "#f78596", "#7897d2", "#aacdff", "#667baf"].map((color, index) => <rect key={color} x={14 + index % 3 * 13} y={14 + Math.floor(index / 3) * 13} width="10" height="10" rx="3" fill={color} />)}
  </> },
  safari: { top: "#fbfcff", bottom: "#cad7ed", art: <>
    <circle cx="32" cy="32" r="24.5" fill="#1695e9" stroke="#fcfeff" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="21" fill="none" stroke="#f5fbff" strokeWidth="2" strokeDasharray="1 3.1" opacity=".85" />
    <path d="m44 20-8 17-8-9Z" fill="#ff5262" /><path d="m20 44 8-16 8 9Z" fill="#fff" />
    <circle cx="32" cy="32" r="2" fill="#e8f4ff" />
  </> },
  maps: { top: "#e5f5e6", bottom: "#90cdb5", art: <>
    <path d="M0 13 16 6l16 7 16-7 16 7v51H0Z" fill="#cbe6ba" />
    <path d="M0 48 18 32l17 8 29-17v41H0Z" fill="#83cde5" />
    <path d="M0 21 19 34l19-10 26 12M16 0l9 23-9 41M47 0 34 24l14 40" stroke="#fff" strokeWidth="4" fill="none" />
    <path d="M7 60 23 34l41-14" stroke="#ffd46f" strokeWidth="4" fill="none" />
    <path d="M48 22c0 6-7 13-7 13s-7-7-7-13a7 7 0 1 1 14 0Z" fill="#f45360" /><circle cx="41" cy="22" r="2.7" fill="white" />
  </> },
  weather: { top: "#55beff", bottom: "#256fdb", art: <>
    <circle cx="38" cy="26" r="13" fill="#ffd86a" />
    <path d="M11 41a7 7 0 0 1 7-7h2a9 9 0 0 1 16-3 7 7 0 1 1 5 17H18a7 7 0 0 1-7-7Z" fill="#f6fbff" />
  </> },
  stocks: { top: "#343f58", bottom: "#192131", art: <>
    <path d="M9 18h46M9 31h46M9 44h46M18 11v42m14-42v42m14-42v42" fill="none" stroke="#8daac8" strokeWidth="1" opacity=".35" />
    <path d="m9 47 10-12 8 4 7-14 9 4 12-12" fill="none" stroke="#82e5dc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="55" cy="17" r="3" fill="#c3ffeb" />
  </> },
  messages: { top: "#76ec83", bottom: "#20b74d", art: <>
    <path d="M32 13c13 0 22 7 22 17 0 9-10 17-22 17-4 0-7-.5-10-2l-9 6 3-11c-4-3-6-7-6-11 0-9 10-16 22-16Z" fill="#f9fff7" />
    <path d="M21 28h22" stroke="#a7e2c1" strokeWidth="2.5" strokeLinecap="round" />
  </> },
  contacts: { top: "#edba98", bottom: "#ba785c", art: <>
    <rect x="13" y="10" width="35" height="45" rx="5" fill="#fff2df" />
    <path d="M45 18h7v7h-7zm0 12h7v7h-7zm0 12h7v7h-7z" fill="#7e5352" />
    <circle cx="30" cy="27" r="6" fill="#cb9075" /><path d="M19 43a11 9 0 0 1 22 0Z" fill="#cb9075" />
  </> },
  facetime: { top: "#75e5a9", bottom: "#19ae66", art: <>
    <rect x="12" y="19" width="27" height="25" rx="7" fill="#effff5" />
    <path d="m36 27 11-7q5-2 5 3v17q0 5-5 3l-11-7Z" fill="#effff5" />
    <path d="M19 23h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </> },
  calendar: { top: "#fff8f6", bottom: "#e9edf6", art: <CalendarDate /> },
  reminders: { top: "#fbfcff", bottom: "#e2e9f7", art: <>
    {["#f2a54e", "#55aaf7", "#f17485"].map((color, i) => <g key={color}><circle cx="15" cy={18 + i * 13} r="3.8" fill={color} /><path d={`M25 ${18 + i * 13}h25`} stroke="#8293ad" strokeWidth="2.5" strokeLinecap="round" /></g>)}
  </> },
  freeform: { top: "#f7f8ff", bottom: "#dce9fb", art: <>
    <path d="M14 42c2-14 9-20 19-20 9 0 10 12 1 14-8 2-10-10-1-15 10-6 17-2 19 4" fill="none" stroke="#7ba4f5" strokeWidth="5" strokeLinecap="round" />
    <path d="m20 45 25-25 6 6-25 25-9 2Z" fill="#d0699a" /><path d="m43 22 5-5q2-2 4 0l3 3q2 2 0 4l-6 4Z" fill="#a353a8" />
  </> },
  textedit: { top: "#f8fbff", bottom: "#ccdcf2", art: <>
    <rect x="14" y="9" width="33" height="45" rx="4" fill="#fff" />
    <path d="M20 18h20m-20 8h20m-20 8h20m-20 8h13" stroke="#a5b5ca" strokeWidth="2" strokeLinecap="round" />
    <path d="m33 43 16-17 5 5-16 17-8 3Z" fill="#376cb0" /><path d="m46 28 4-4q2-2 4 0l2 2q2 2 0 4l-4 4Z" fill="#76b8ed" />
  </> },
  voice: { top: "#45506d", bottom: "#222739", art: <>
    <path d="M7 32h50" stroke="#bf7897" strokeWidth="1" opacity=".75" />
    {[7, 15, 28, 39, 18, 32, 23, 10, 5].map((height, index) => <path key={index} d={`M${12 + index * 5} ${32 - height / 2}v${height}`} stroke={index < 5 ? "#ff82a1" : "#c59bf6"} strokeWidth="2.5" strokeLinecap="round" />)}
  </> },
  music: { top: "#ff86a0", bottom: "#e03666", art: <>
    <path d="M29 17v25c0 4-4 7-9 7-4 0-7-2-7-5s4-7 9-7c1 0 2 0 3 .3V18l22-5v25c0 4-4 7-9 7-4 0-7-2-7-5s4-7 9-7c1 0 2 0 3 .3V22Z" fill="#fff7fa" />
  </> },
  podcasts: { top: "#c58bfa", bottom: "#7a48cb", art: <>
    <path d="M21 46a18 18 0 1 1 22 0m-17-6a11 11 0 1 1 12 0" fill="none" stroke="#f8edff" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="32" cy="25" r="4" fill="#fff" /><path d="M27 35q5-4 10 0l-2 15q-3 3-6 0Z" fill="#fff" />
  </> },
  tv: { top: "#34435d", bottom: "#191f31", art: <>
    <rect x="10" y="14" width="44" height="34" rx="7" fill="#e4eafa" /><rect x="13" y="17" width="38" height="28" rx="5" fill="#899ac1" />
    <path d="m28 23 13 8-13 8Z" fill="#faffff" /><path d="M25 52h14" stroke="#c6d5ee" strokeWidth="3" strokeLinecap="round" />
  </> },
  books: { top: "#ffbc69", bottom: "#ed7b30", art: <>
    <path d="M11 15q12-4 21 5 9-9 21-5v31q-12-4-21 4-9-8-21-4Z" fill="#fff9ec" />
    <path d="M32 21v27m-16-25 10 2m-10 5 10 2m12-6 10-2m-10 9 10-2" stroke="#ecad78" strokeWidth="1.5" strokeLinecap="round" />
  </> },
  appstore: { top: "#64c7ff", bottom: "#1674d6", art: <>
    <path d="M16 41h33M22 49l15-31m-12 0 17 31" fill="none" stroke="#f7fdff" strokeWidth="5.5" strokeLinecap="round" />
    <circle cx="47" cy="44" r="2.1" fill="#bce6ff" />
  </> },
  clock: { top: "#617399", bottom: "#313c5a", art: <ClockHands /> },
  calculator: { top: "#61708d", bottom: "#30394d", art: <>
    <rect x="13" y="8" width="38" height="48" rx="8" fill="#253247" /><rect x="18" y="13" width="28" height="10" rx="3" fill="#a3c4e6" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={18 + i % 3 * 10} y={28 + Math.floor(i / 3) * 8} width="7" height="5.5" rx="1.8" fill={i % 3 === 2 ? "#ffbd76" : "#e8eef6"} />)}
  </> },
  settings: { top: "#a2afc4", bottom: "#4f607b", art: <>
    <circle cx="32" cy="32" r="21" fill="#dbe6f3" /><circle cx="32" cy="32" r="16" fill="#7789a7" />
    <circle cx="32" cy="32" r="9" fill="#e1eaf5" /><circle cx="32" cy="32" r="4" fill="#7487a4" />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d="M32 13v6" transform={`rotate(${i * 45} 32 32)`} stroke="#ecf2fa" strokeWidth="3" strokeLinecap="round" />)}
  </> },
  activity: { top: "#333e55", bottom: "#151f31", art: <>
    <path d="M10 16h44M10 26h44M10 36h44M10 46h44M18 12v40m10-40v40m10-40v40m10-40v40" fill="none" stroke="#adc5cd" opacity=".27" />
    <path d="M8 37h10l6-8 5 11 7-19 6 11h14" fill="none" stroke="#80efad" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </> },
  diskutil: { top: "#edf5fd", bottom: "#91a8c3", art: <>
    <path d="M12 29 20 17h24l8 12v15q0 4-4 4H16q-4 0-4-4Z" fill="#d5e2f0" stroke="#748aa6" strokeWidth="1.5" />
    <path d="M13 31h38v13q0 3-4 3H17q-4 0-4-3Z" fill="#f0f6fd" /><path d="M20 39h17" stroke="#8296b4" strokeWidth="2" strokeLinecap="round" /><circle cx="45" cy="39" r="2.4" fill="#79bea9" />
  </> },
  fontbook: { top: "#eee6fa", bottom: "#b6a0cc", art: <>
    <rect x="12" y="12" width="40" height="41" rx="7" fill="#fffafd" />
    <text x="32" y="43" textAnchor="middle" fontSize="29" fontWeight="700" fontFamily="Georgia, serif" fill="#684884">Aa</text>
  </> },
};

export function LibraryIcon({ id }: { id: LibraryIconId }) {
  const { top, bottom, art } = tiles[id];
  if (customIcons[id]) return <DockIcon name={id} />;
  return (
    <span aria-hidden="true" className="dock-icon-tile grid size-full place-items-center">
      <span className="library-icon-tile grid size-[92%] overflow-hidden rounded-[23%]" style={{ backgroundImage: `linear-gradient(150deg, ${top}, ${bottom})` }}>
        <svg className="size-full" viewBox="0 0 64 64">{art}</svg>
      </span>
    </span>
  );
}
