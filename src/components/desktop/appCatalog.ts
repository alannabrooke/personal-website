export const appCatalog = {
  safari: { title: "Safari", group: "Explore", size: [880, 610], keywords: "browser web wikipedia bookmarks" },
  maps: { title: "Maps", group: "Explore", size: [850, 580], keywords: "places cities map" },
  weather: { title: "Weather", group: "Explore", size: [490, 555], keywords: "forecast temperature" },
  stocks: { title: "Stocks", group: "Explore", size: [700, 510], keywords: "watchlist chart market" },
  messages: { title: "Messages", group: "Connect", size: [720, 520], keywords: "chat conversations" },
  contacts: { title: "Contacts", group: "Connect", size: [660, 480], keywords: "address book people email" },
  facetime: { title: "FaceTime", group: "Connect", size: [710, 530], keywords: "camera video preview" },
  calendar: { title: "Calendar", group: "Create", size: [850, 575], keywords: "month dates schedule events" },
  reminders: { title: "Reminders", group: "Create", size: [580, 500], keywords: "tasks to do checklist" },
  freeform: { title: "Freeform", group: "Create", size: [850, 590], keywords: "draw sketch board canvas" },
  textedit: { title: "TextEdit", group: "Create", size: [650, 510], keywords: "text editor document" },
  voice: { title: "Voice Memos", group: "Create", size: [680, 510], keywords: "audio microphone record" },
  music: { title: "Music", group: "Media", size: [760, 520], keywords: "audio tracks player synth" },
  podcasts: { title: "Podcasts", group: "Media", size: [730, 520], keywords: "shows episodes listening" },
  tv: { title: "TV", group: "Media", size: [810, 580], keywords: "video films watch" },
  books: { title: "Books", group: "Media", size: [740, 550], keywords: "library read ebook" },
  appstore: { title: "App Store", group: "Utilities", size: [800, 550], keywords: "discover desktop applications" },
  clock: { title: "Clock", group: "Utilities", size: [510, 480], keywords: "timer stopwatch world time" },
  calculator: { title: "Calculator", group: "Utilities", size: [315, 465], keywords: "arithmetic math" },
  settings: { title: "System Settings", group: "Utilities", size: [645, 480], keywords: "preferences wallpaper dock magnification" },
  activity: { title: "Activity Monitor", group: "Utilities", size: [690, 480], keywords: "windows apps activity performance" },
  diskutil: { title: "Disk Utility", group: "Utilities", size: [590, 440], keywords: "browser storage estimate usage" },
  fontbook: { title: "Font Book", group: "Utilities", size: [745, 530], keywords: "typeface fonts typography" },
} as const;

export type LibraryAppId = keyof typeof appCatalog;
export const libraryAppIds = Object.keys(appCatalog) as LibraryAppId[];
