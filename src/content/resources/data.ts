export interface Resource {
  link: string;
  title: string;
  description: string;
  hostname: string;
}

export const resources: Record<string, Resource[]> = {
  Development: [
    {
      link: "https://www.conventionalcommits.org/en/v1.0.0/#summary",
      title: "Conventional Commits",
      description: "Conventional [Git] commits gives you a framework to make your commit messages useful.",
      hostname: "conventionalcommits.org",
    },
    {
      link: "https://www.thepunctuationguide.com/index.html",
      title: "The Punctuation Guide",
      description: "Learn how to spell & punctuate... please.",
      hostname: "thepunctuationguide.com",
    },
  ],

  Design: [
    {
      link: "https://excalidraw.com/",
      title: "Excalidraw",
      description: "Drawing & online white-boarding tool for cool people.",
      hostname: "excalidraw.com",
    },
  ],
  Learning: [
    {
      link: "https://www.youtube.com/@CodeAesthetic",
      title: "CodeAesthetic",
      description: "An amazing YouTube resource that will provide you with a enormous amount of useful information.",
      hostname: "youtube.com",
    },
  ]
};
