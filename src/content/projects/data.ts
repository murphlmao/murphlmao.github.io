/* Project data. `id` gives the resume page its anchors (`rs-p-<id>`) and the
   skill-evidence links their targets (R28). */
export interface Project { id: string; title: string; description: string; link: string; tech: string[]; status: string }

export const projects: Project[] = [
  {
    id: "vs-file-split",
    title: "VS File Split",
    description:
      "Visual Studio [Code] File Split is a file system monitor & file splitter for creating multiple files at once in VSCode.",
    link: "https://github.com/murphlmao/vs-file-split",
    tech: [
      "Go",
      "GitHub Actions",
    ],
    status: "Live",
  },
  {
    id: "wrike",
    title: "Wrike Email Link Translator",
    description: "A [Google Cloud Platform] extension to translate Wrike email addresses to Wrike task links by detecting them in email your active email threads.",
    link: "https://github.com/murphlmao/wrike-email-link-translator",
    tech: ["JavaScript", "Google Apps Script", "GCP"],
    status: "Live",
  },
  {
    id: "create-py-app",
    title: "Create-Py-App",
    description:
      "CLI Tool to create a standard Python repository structure",
    link: "https://github.com/murphlmao/create-py-app",
    tech: ["Rust", "Askama", "Python", "GitHub Actions"],
    status: "Live",
  },
];

export const techStack: Record<string, string[]> = {
  Languages: [
    "Python",
    "Rust",
    "Go",
    "TypeScript",
    "C",
    "C#",
    "C++",
    "SQL",
    "Bash"
  ],
  "Frameworks / Libraries": [
    "FastAPI",
    "React",
    "Next.js",
    "Remix",
    "Hugo",
    "HTMX",
    "Electron",
    "Node.js",
    "Deno",
    "Tailwind CSS",
  ],

  "DevOps & Infrastructure": [
    "Azure",
    "GCP",
    "Git",
    "Ansible",
    "Docker",
    "Kubernetes",
    "Terraform",
    "Nginx",
    "CI/CD",
  ],
  "IT & Systems Administration": [
    "Linux",
    "Windows Server",
    "AD/DS",
    "Networking",
    "Cybersecurity",
    "Virtualization",
  ],
  "Databases": [
    "PostgreSQL",
    "SQLite",
    "Redis"
  ],
  "Misc. Skills": [
    "Videography",
    "Color Grading",
    "Professional Communication",
  ],
};
