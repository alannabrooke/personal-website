// All of the site's text lives here. Edit this file to make the site yours.

export const profile = {
  name: "Alanna Brooke",
  initials: "AB",
  title: "Designer & Developer",
  location: "Your City",
  email: "you@example.com",
  // Shown in the terminal prompt: user@host
  handle: "alanna",
  host: "macbook",
  tagline: "I make thoughtful, well-crafted things for the web.",
};

export const socials = [
  { label: "GitHub", href: "https://github.com/alannabrooke" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
];

export type Note = {
  id: string;
  title: string;
  date: string;
  body: string[];
};

// Shown in the Notes app. The first note opens when the site loads.
export const notes: Note[] = [
  {
    id: "about",
    title: "About Me",
    date: "Today",
    body: [
      `Hi, I'm ${profile.name} 👋`,
      "A few sentences about who you are, what you do, and what you care about. Keep it short and friendly: this is the first thing visitors read.",
      "Explore the dock below: Finder has my projects, Preview has my résumé, Mail is the fastest way to reach me, and Terminal is there if you like typing.",
    ],
  },
  {
    id: "now",
    title: "What I'm doing now",
    date: "This month",
    body: [
      "• Working on: something you're excited about",
      "• Learning: a skill you're picking up",
      "• Reading: a book you'd recommend",
    ],
  },
  {
    id: "skills",
    title: "Skills & tools",
    date: "Updated recently",
    body: [
      "Design: Figma, prototyping, design systems",
      "Code: TypeScript, React, Next.js, Tailwind CSS",
      "Other: writing, workshops, project leadership",
    ],
  },
  {
    id: "fun",
    title: "Fun facts",
    date: "Always true",
    body: [
      "• A hobby you love",
      "• Somewhere you've travelled",
      "• Your go-to coffee order",
    ],
  },
];

export type Project = {
  id: string;
  name: string;
  year: string;
  role: string;
  description: string;
  tags: string[];
  href?: string;
  color: string; // folder tint, any CSS color
};

// Shown in Finder.
export const projects: Project[] = [
  {
    id: "project-one",
    name: "Project One",
    year: "2026",
    role: "Design & development",
    description:
      "What the project was, the problem it solved, your role, and the result. One or two sentences is plenty.",
    tags: ["Next.js", "Tailwind", "Design"],
    href: "https://example.com",
    color: "#5aa9f6",
  },
  {
    id: "project-two",
    name: "Project Two",
    year: "2025",
    role: "Product design",
    description:
      "What the project was, the problem it solved, your role, and the result. One or two sentences is plenty.",
    tags: ["Figma", "Research"],
    href: "https://example.com",
    color: "#f6a35a",
  },
  {
    id: "project-three",
    name: "Project Three",
    year: "2024",
    role: "Front-end development",
    description:
      "What the project was, the problem it solved, your role, and the result. One or two sentences is plenty.",
    tags: ["React", "TypeScript"],
    color: "#8bd17c",
  },
  {
    id: "project-four",
    name: "Project Four",
    year: "2023",
    role: "Brand & web",
    description:
      "What the project was, the problem it solved, your role, and the result. One or two sentences is plenty.",
    tags: ["Branding", "Web"],
    color: "#c58af9",
  },
];

// Shown in Preview (résumé).
export const resume = {
  summary:
    "A one- or two-line summary of your experience and what you're looking for.",
  experience: [
    {
      role: "Job Title",
      company: "Company Name",
      period: "2024 – Present",
      points: ["An accomplishment, with a number if you can.", "Another accomplishment."],
    },
    {
      role: "Job Title",
      company: "Company Name",
      period: "2021 – 2024",
      points: ["An accomplishment, with a number if you can.", "Another accomplishment."],
    },
  ],
  education: [{ school: "School Name", degree: "Degree, Field", period: "2017 – 2021" }],
  skills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Figma"],
};

export type IconName =
  | "finder"
  | "notes"
  | "mail"
  | "preview"
  | "terminal"
  | "trash"
  | "github"
  | "linkedin";

// Optional: replace any app icon with your own image.
// Put the file in public/icons/ and add a line here, for example:
//   finder: "/icons/finder.png",
// Square PNG, SVG or WebP files around 512×512 work best. Use only icons you
// made or have a license to use on a website. Leave an entry out to keep the
// built-in drawn icon.
export const customIcons: Partial<Record<IconName, string>> = {};
