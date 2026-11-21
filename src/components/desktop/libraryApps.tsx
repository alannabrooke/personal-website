import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { appCatalog, libraryAppIds, type LibraryAppId } from "./appCatalog";
import type { AppDef } from "./apps";
import { LibraryIcon } from "./libraryIcons";

const views: Record<LibraryAppId, ComponentType> = {
  safari: dynamic(() => import("@/components/apps/library/explore").then((module) => module.SafariApp)),
  maps: dynamic(() => import("@/components/apps/library/explore").then((module) => module.Maps)),
  weather: dynamic(() => import("@/components/apps/library/explore").then((module) => module.Weather)),
  stocks: dynamic(() => import("@/components/apps/library/explore").then((module) => module.Stocks)),
  messages: dynamic(() => import("@/components/apps/library/productivity").then((module) => module.Messages)),
  contacts: dynamic(() => import("@/components/apps/library/productivity").then((module) => module.Contacts)),
  facetime: dynamic(() => import("@/components/apps/library/media").then((module) => module.FaceTime)),
  calendar: dynamic(() => import("@/components/apps/library/productivity").then((module) => module.Calendar)),
  reminders: dynamic(() => import("@/components/apps/library/productivity").then((module) => module.Reminders)),
  freeform: dynamic(() => import("@/components/apps/library/productivity").then((module) => module.Freeform)),
  textedit: dynamic(() => import("@/components/apps/library/productivity").then((module) => module.TextEdit)),
  voice: dynamic(() => import("@/components/apps/library/media").then((module) => module.VoiceMemos)),
  music: dynamic(() => import("@/components/apps/library/media").then((module) => module.Music)),
  podcasts: dynamic(() => import("@/components/apps/library/media").then((module) => module.Podcasts)),
  tv: dynamic(() => import("@/components/apps/library/media").then((module) => module.TV)),
  books: dynamic(() => import("@/components/apps/library/media").then((module) => module.Books)),
  appstore: dynamic(() => import("@/components/apps/library/media").then((module) => module.AppStore)),
  clock: dynamic(() => import("@/components/apps/library/utilities").then((module) => module.ClockApp)),
  calculator: dynamic(() => import("@/components/apps/library/utilities").then((module) => module.Calculator)),
  settings: dynamic(() => import("@/components/apps/library/utilities").then((module) => module.SystemSettings)),
  activity: dynamic(() => import("@/components/apps/library/utilities").then((module) => module.ActivityMonitor)),
  diskutil: dynamic(() => import("@/components/apps/library/utilities").then((module) => module.DiskUtility)),
  fontbook: dynamic(() => import("@/components/apps/library/utilities").then((module) => module.FontBook)),
};

export const libraryApps = Object.fromEntries(libraryAppIds.map((id): [LibraryAppId, AppDef] => {
  const info = appCatalog[id];
  const [w, h] = info.size;
  return [id, {
    id,
    name: info.title,
    title: info.title,
    Icon: () => <LibraryIcon id={id} />,
    Component: views[id],
    size: { w, h },
    minSize: { w: Math.min(w, 370), h: Math.min(h, 320) },
    chrome: "toolbar",
  }];
})) as Record<LibraryAppId, AppDef>;
