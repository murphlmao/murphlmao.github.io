# Content pack — murph.rip redesign, round two

Use this content verbatim. Do not invent articles, jobs, projects, or copy beyond small UI labels.

Asset paths are relative to a preview page living at `docs/redesign-previews/<version>/page.html`, so the repo's `public/` folder is `../../../public/`.

## Identity

- Name: Murphy Malcolm. Domain: murph.rip.
- Photo: `../../../public/profile.jpeg` (300x277).
- Socials (icons, in this order): GitHub https://github.com/murphlmao · Spotify https://open.spotify.com/user/bigseeexyman · LinkedIn https://www.linkedin.com/in/murphymalcolm/ · Instagram https://instagram.com/murphlmao
- Bio, keep as is (light edits to punctuation allowed, no rewriting):
  > I'm a software & platform engineer at Prism Controls and a Computer Science student at the University of Michigan, specializing in full-stack development, DevSecOps, and embedded systems. I've a deep passion for all of the above, but also Linux (Arch btw), networking, cybersecurity, and cats!
  >
  > I'm opinionated about technology, but those opinions come from a genuine love of the game and a drive to continuously learn and improve. Always happy to connect and talk.

## Navigation (keep these items and this order)

Home · Articles · Snippets · Resources · Projects, plus a deer icon on the right (title "Tragedy & Pain.", link to `#`) and a sun/moon toggle icon (no-op in the preview, dark only). Footer: Articles · Snippets · Resources · Projects, and "© 2026 Murphy Malcolm. All rights reserved."

## Work (home page panel)

- Prism Controls — Software & Platform Engineer — June 2022 to Present — logo `../../../public/icons/prismcontrols.jpg`
- Self Employed — IT & Software Engineer / Consultant — March 2015 to July 2023 — logo `../../../public/icons/selfemployed.jpg`
- Button: "Download CV" → `../../../public/Murphy Malcolm - Resume (Public).pdf` (URL-encode the spaces)

## Articles

Stats line used on the index today: "Since 2025 I've written 16 articles and 31,701 words. Please enjoy my strong opinions, feelings, and some of my study material here!"

Structure is header → category → articles. Today there is one header. Murphy also wants to write articles that are not tied to a course, so the index design must not assume every article belongs to a university class. Do not invent such articles; just make sure the layout has an obvious place for a second, non-university group.

Header: "University of Michigan - CompSci" — "Course notes and study resources for UMich computer science classes" — icon `../../../public/icons/umich-m.svg`

Categories in course order (icon path, name, description, count):
- `../../../public/icons/eecs280logo.png` — EECS 280 — Programming and Intro Data Structures — 13
- `../../../public/icons/eecs281logo.png` — EECS 281 — Data Structures & Algorithms — 1
- `../../../public/icons/eecs370logo.jpg` — EECS 298 — Empathetic Leadership and the Social Context of Computing — 0 (shows "No posts in this category yet.")
- `../../../public/icons/eecs370logo.jpg` — EECS 370 — Intro to Computer Organization — 2

Articles, newest first. On the Articles index, newest first. On a category page, oldest first (course order for students).

- 2026-01-13 · EECS 370 · Binary & Hex — How to count like a computer and why your CPU doesn't speak English. Binary, hexadecimal, two's complement, bitwise shifting, stuff like that.
- 2026-01-10 · EECS 281 · Complexity Analysis & Big(O) — That's a very Big O-oooooooh shit what the FUCK is this???? The worst part of computer science?? YESSSIRRRR.
- 2026-01-08 · EECS 370 · Logic Gates & Discrete Math Foundation — The math that makes your computer go brrrrr. Boolean algebra, logic gates, and why true + true = true.
- 2025-12-12 · EECS 280 · Binary Search Trees — Binary search trees are lowkey like trees.. that grew from seeds from Australia. All upside down n shii.
- 2025-12-11 · EECS 280 · Recursion: Tail, Structural, & Tree — I'm going to recurse(recurse(recurse(recurse(recurse(please make it stop)))))
- 2025-12-11 · EECS 280 · Containers, Iterators, & Linked Lists — I avoid iteration like the plague and use map (or similar) unless I'm held at gunpoint.
- 2025-12-08 · EECS 280 · The Unholy Rules of Three, Five, & Zero — I had to split this away from the C++ classes post because this language is god awful.
- 2025-12-01 · EECS 280 · C++ Classes, Operator Overloading, & Templates — You have no idea how long I procrastinated writing this. C++ classes are wild & easily contain some of the worst parts of the language.
- 2025-11-20 · EECS 280 · Exceptions, Error Handling, & Exit Codes — Favorite error messages: 'Object reference not set to the instance of an object', 'Something went wrong', and 'Bailing out, you are on your own. Good luck.'
- 2025-11-19 · EECS 280 · C-Style ADTs & Strings in C++ — Hey, finally, a topic that is much more interesting, subjective, and abstract! Literally!
- 2025-11-17 · EECS 280 · The Joy of Constants — I really did not want to talk about constants lol. They're incredibly boring, and the syntax is immensely frustrating. But they're important, so here we are.
- 2025-11-16 · EECS 280 · Streams & I/O — This is not relevant at all, but I constantly regret the period of my life where I tried live-streaming. Bro was dreaming a little TOO big.
- 2025-11-14 · EECS 280 · What is the Heap? The Hell That is Dynamic Memory — 1980s: yells down the hall: 'Hey everyone I'm using 0xE000, try not to clobber it, thanks!'
- 2025-11-13 · EECS 280 · Arrays & Pointer Arithmetic — You guys ever learn so much about something you really didn't want to learn about? That's been me for all of Fall 2025.
- 2025-11-11 · EECS 280 · Intro to Pointers & References — Pointer? I barely even knew her! Can you allocate a pointer to my heart??? Do you know how long I've been single for????
- 2025-11-11 · EECS 280 · What is the Stack? — The stack makes me want to reference my head against a wall repeatedly until I heap.

Category page to build: EECS 280 (13 articles, oldest first, so it starts with "What is the Stack?").

## Article page content: "Complexity Analysis & Big(O)"

Meta: January 10, 2026 · EECS 281 · about 14 min read. Previous in course: none. Next in course: none. Show a "Back to EECS 281" affordance instead of prev/next when both are empty, but style prev/next so it exists for other articles (you can render it with EECS 280 neighbors greyed as a demonstration only if it looks natural; otherwise leave it out).

Body. Real prose, keep the profanity.

---

## Why Should We Give A Shit?

This is a question I've wanted to avoid for as long as humanly possible. Why? Because its math. Math, notoriously, blows. Why should you care? Will I use this in my day to day? Honestly, probably not. But the reality of the situation is that you need some way to represent these abstract ideas, even if you recognize, mentally, that some ways of writing code are just better (and more clever) than others.

For example, let's take a really simple problem: "How can I find a duplicate number in my array?" As simple as this question is, the consequences for how you solve this problem can be vast. I'll get into the nitty gritty of Big O later, so just bear with me through this example: To some people, this is how they would genuinely think to solve the issue:

```text
Vector: [1, 2, 3, 4, 5]

cursor1 = 0, checks against:
   v
  [1, 2, 3, 4, 5]
      ^  ^  ^  ^  (cursor2 goes 1→4)

cursor1 = 1, checks against:
      v
  [1, 2, 3, 4, 5]
         ^  ^  ^  (cursor2 goes 2→4)
```

As code, this comes out as:

```cpp
bool duplicate_nested(std::vector<int> vec) {
  for(int cursor1 = 0; cursor1 < vec.size(); cursor1++) {
    for (int cursor2 = cursor1 + 1; cursor2 < vec.size(); cursor2++)
      if (vec[cursor1] == vec[cursor2]) { return true; }
  }
  return false;
}
// time: ~0.510 seconds for 10,000 items
```

While this is a *valid* way to solve the problem, it's actually one of the *worst* ways to do so. Why? Because for every item in the array, you're checking it against *every other item* in the array. This means that if you have 10 items, you could be doing up to 100 checks. If you have 100 items, you could be doing up to 10,000 checks. This is a classic example of an algorithm with O(n²) time complexity.

"So, what's a better way?" Your Grandmother asks at the dinner table. Great question, Grandma! A better way to solve this problem is to use a data structure that A) Doesn't allow duplicates, and B) Has fast lookup times. A `std::unordered_set` in C++ is perfect for this:

```cpp
bool duplicate_simple(std::vector<int> vec) {
  std::unordered_set<int> seen_values;
  for (int nums : vec) {
    if (seen_values.count(nums)) { return true; }
    seen_values.insert(nums);
  }
  return false;
}
// time: ~0.0006 seconds for 10,000 items
```

#### Time vs. Space: The Eternal Tradeoff

Notice what we did here: our shitty nested loop solution used **O(1) space** (just two integer cursors, no matter how big the input), but **O(n²) time**. The hash set solution uses **O(n) space** (storing up to n elements) but only **O(n) time**. We traded memory for speed. This tradeoff shows up *constantly* in algorithm design - faster solutions often need more memory, and memory-efficient solutions are often slower.

## What Is An Algorithm?

An algorithm is a set of instructions. That's it. There is literally nothing else to it.

## What. The Fuck. Is. Complexity Analysis?

If you've ever been in a college level computer science classroom before, or just tried to Google "What does `O(log(n(myparentsneverlovedme)^2*sqrt(15))` mean," one of the first pains you'll suffer will be some dumbass graph like this:

[INTERACTIVE: Big O growth graph. Lines for O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ). A range slider for max n (2..20). Hover a line to highlight it. Vanilla JS + inline SVG. About 300px tall. Quiet: thin lines, one highlight color.]

If you also suck at math, this means very little to you. When I first saw this graph, this is the relationship I was able to identify: Based on the number of items going into something (indicated by the variable `n`), the number of operations will increase based on that amount.

### But *what does this mean*? How does this correlate to code?

The relationship that complexity analysis is trying to create is that which tells you how an algorithm's time/space usage scales as input grows. In other words, you're measuring two main things: time (operations) and space (memory).

---

## Projects page

Title today: "Tech Stack, Skills, & Projects". Intro: "I've worked on dozens of projects over the years, so here is a collection of where *my* specific skill-set lies. Many of them are open-source, so feel free to check them out."

Projects:
- VS File Split — Visual Studio [Code] File Split is a file system monitor & file splitter for creating multiple files at once in VSCode. — Go, GitHub Actions — Live — https://github.com/murphlmao/vs-file-split
- Wrike Email Link Translator — A [Google Cloud Platform] extension to translate Wrike email addresses to Wrike task links by detecting them in email your active email threads. — JavaScript, Google Apps Script, GCP — Live — https://github.com/murphlmao/wrike-email-link-translator
- Create-Py-App — CLI Tool to create a standard Python repository structure — Rust, Askama, Python, GitHub Actions — Live — https://github.com/murphlmao/create-py-app

Tech stack (section "Technical Skills & Specialties"):
- Languages: Python, Rust, Go, TypeScript, C, C#, C++, SQL, Bash
- Frameworks / Libraries: FastAPI, React, Next.js, Remix, Hugo, HTMX, Electron, Node.js, Deno, Tailwind CSS
- DevOps & Infrastructure: Azure, GCP, Git, Ansible, Docker, Kubernetes, Terraform, Nginx, CI/CD
- IT & Systems Administration: Linux, Windows Server, AD/DS, Networking, Cybersecurity, Virtualization
- Databases: PostgreSQL, SQLite, Redis
- Misc. Skills: Videography, Color Grading, Professional Communication

## Snippets page

Title today: "Code snippets for developers". Intro: "A collection of code snippets that may or may not have some utility... somewhere."

- Divisible Cat — A cat that can be divided, optional adoption sign included. — December 1, 2025 — C++ — markdown
- Premature Optimization Triangle — An interactive WASM demo exploring the tradeoffs between performance, velocity, and adaptability. — December 22, 2025 — C++ — interactive

## Resources page

Groups and items (title — description — hostname — link):

Development
- Conventional Commits — Conventional [Git] commits gives you a framework to make your commit messages useful. — conventionalcommits.org — https://www.conventionalcommits.org/en/v1.0.0/#summary
- The Punctuation Guide — Learn how to spell & punctuate... please. — thepunctuationguide.com — https://www.thepunctuationguide.com/index.html

Design
- Excalidraw — Drawing & online white-boarding tool for cool people. — excalidraw.com — https://excalidraw.com/
- Mantine — React component library. Build fully functional web applications with ease. — mantine.dev — https://mantine.dev/
- Shadcn UI — Beautifully designed components built with Radix UI and Tailwind CSS. — ui.shadcn.com — https://ui.shadcn.com/

Learning
- CodeAesthetic — An amazing YouTube resource that will provide you with a enormous amount of useful information. — youtube.com — https://www.youtube.com/@CodeAesthetic
- Theo - t3.gg — YouTuber who makes incredibly informative content on the JavaScript Ecosystem. — youtube.com — https://www.youtube.com/@t3dotgg
- The Primeagen — Another YouTuber who posts incredibly lengthy and engaging discussions on a wide variety of developer topics. — youtube.com — https://www.youtube.com/@ThePrimeTimeagen

## Reverie palette (Murphy's)

#050407 near-black · #2D3D59 navy · #8C8A90 gray · #C98590 dusty pink · #E6E2E4 off-white · #D7263D red
