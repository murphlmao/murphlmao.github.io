/* Project data. `id` gives the resume page its anchors (`rs-p-<id>`) and the
   skill-evidence links their targets (R28). */
export interface Project { id: string; title: string; description: string; link: string; tech: string[]; status: string }

export const projects: Project[] = [
  {
    id: "sid",
    title: "sid",
    description:
      "A fast, focused desktop cockpit for developer workflow: SSH/SFTP, databases, ports & processes, and system tweaks in one native Rust app, scoped per git workspace.",
    link: "https://github.com/murphlmao/sid",
    tech: ["Rust", "GPUI"],
    status: "Building",
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
    id: "quora-prompt-remover",
    title: "Quora Prompt Remover",
    description: "Chrome extension that stripped Quora's forced login prompt. Quora has since patched it.",
    link: "https://github.com/murphlmao/Quora-Prompt-Remover",
    tech: ["JavaScript", "Chrome Extension"],
    status: "Archived",
  },
  {
    id: "vs-file-split",
    title: "VS File Split",
    description:
      "Visual Studio [Code] File Split is a file system monitor & file splitter for creating multiple files at once in VSCode.",
    link: "https://github.com/murphlmao/vs-file-split",
    tech: ["Go", "GitHub Actions"],
    status: "Archived",
  },
  {
    id: "create-py-app",
    title: "Create-Py-App",
    description: "CLI Tool to create a standard Python repository structure",
    link: "https://github.com/murphlmao/create-py-app",
    tech: ["Rust"],
    status: "Archived",
  },
];
