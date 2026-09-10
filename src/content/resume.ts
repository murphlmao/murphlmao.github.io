/* Resume data — every string verbatim from docs/redesign-previews/_brief/resume.md.
   `experience` also feeds the home rail (src/pages/index.astro); the rest feeds
   src/pages/resume.astro. Evidence text is pulled from the bullets/descriptions
   themselves (see `ev`/`pev`) so it can never drift out of verbatim. */
import { projects } from './projects/data';

export interface Entry { id: string; org: string; place: string; title: string; start: string; end: string; gpa?: string; bullets: string[]; note?: string }

export const summary = 'Software Engineer with expertise in full-stack development, DevSecOps, and embedded development. Skilled in Python, Rust, C, and CI/CD automation. Strong systems thinker who excels at architectural planning, identifying integration points across complex projects, and driving solutions from concept to deployment.';

export const contact = { email: 'murphyjmalcolm@gmail.com', place: 'Ann Arbor, MI', site: 'murph.rip' };

export const experience: Entry[] = [
  { id: 'rs-prism', org: 'Prism Controls', place: 'Lowell, MI', title: 'Software & Platform Engineer', start: 'June 2022', end: 'Current', bullets: [
    'Led a team of 2 junior developers in rewriting the front-end & back-end of our Responsive Egg Flow product.',
    'Delivered product demonstrations to customers, translating technical capabilities into business value and gathering feedback for feature development.',
    'Standardized Git workflows, coding standards, and CI/CD architecture across the engineering team.',
    'Built configuration and package management infrastructure across 5+ projects with automated security analysis, saving 100+ hours in deployment and troubleshooting.',
    'Led recruitment and technical interviews for the NPD team, successfully hiring 5 engineers.' ] },
  { id: 'rs-kctc-work', org: 'Kent Career Technical Center', place: 'Grand Rapids, MI', title: 'IT HelpDesk', start: 'August 2022', end: 'June 2023', bullets: [
    'Handled the majority of high complexity tickets from students & staff while maintaining high user satisfaction.',
    'Troubleshooted complex educational network infrastructure while minimizing downtime & improving performance.' ] },
  { id: 'rs-consulting', org: 'Self-Employed Consultant', place: 'Grand Rapids, MI', title: 'Freelance Software & IT Consultant', start: 'March 2015', end: 'July 2023', bullets: [
    'Delivered medium to large-scale coding projects, including web development, home automation, and IoT monitors.',
    'Developed CLI utilities, web scrapers, full-stack project templates, and stress testing utilities.',
    'Implemented secure network segmentation for IoT devices to enhance data privacy and limit telemetry exposure.' ] },
];

export const education: Entry[] = [
  /* `note` is the label of the course-notes line; resume.astro builds the links
     from the blog structure at render time. */
  { id: 'rs-umich', org: 'University of Michigan', place: 'Ann Arbor, MI', title: 'Computer Science, B.S', start: 'September 2025', end: 'Current', note: 'notes on this site', bullets: [
    'Tutored numerous students in introductory programming courses & version control.',
    'Identified & reported 5+ security vulnerabilities in autograding build environments.',
    'Leveraging prior industry experience to provide real-world context in academic team projects.' ] },
  { id: 'rs-grcc', org: 'Grand Rapids Community College', place: 'Grand Rapids, MI', title: 'Computer Support Specialist, A.A.A.S.', start: 'January 2022', end: 'April 2025', gpa: '3.90 / 4.00', bullets: [
    'Tutored numerous courses in programming & system administration.',
    'Delivered volunteer lectures on technical coursework to high school students.' ] },
  { id: 'rs-kctc', org: 'Kent Career Technical Center', place: 'Grand Rapids, MI', title: 'Career & Technical Education (CTE) — Advanced IT, Networking, & Cybersecurity', start: 'August 2021', end: 'June 2023', gpa: '4.00 / 4.00', bullets: [
    'Coursework in IT HelpDesk, networking, domain administration, & system deployments.',
    'Earned professional certifications: ITF+, Network+, & Python Specialist (Among others).',
    'Served as a mentor and resource for dozens of first-year students.' ] },
];

export const certifications = ['ITF+', 'Network+', 'Python Specialist'];

export type Where = 'work' | 'school' | 'project';
export interface Evidence { where: Where; text: string; href: string; source: string }
/* `id` is only set on skills that expand — r4's plain rows carry no id. */
export interface Skill { name: string; id?: string; evidence: Evidence[] }
export interface SkillGroup { name: string; skills: Skill[] }

const entries = [...experience, ...education];
/** Evidence from the Nth bullet (1-based, as spec-resume.md numbers them) of an entry. */
const ev = (where: Where, id: string, n: number, source: string): Evidence =>
  ({ where, text: entries.find((e) => e.id === id)!.bullets[n - 1], href: `#${id}`, source });
/** Evidence from a project's description sentence. */
const pev = (id: string): Evidence => {
  const p = projects.find((x) => x.id === id)!;
  return { where: 'project', text: p.description, href: `#rs-p-${id}`, source: p.title };
};
const plain = (name: string): Skill => ({ name, evidence: [] });

export const skillGroups: SkillGroup[] = [
  { name: 'Programming Languages', skills: [
    { name: 'Python', id: 'sk-python', evidence: [
      ev('work', 'rs-consulting', 2, 'Consulting'),
      ev('school', 'rs-umich', 1, 'UMich'),
      ev('school', 'rs-grcc', 1, 'GRCC'),
      ev('school', 'rs-kctc', 2, 'KCTC'),
      pev('create-py-app') ] },
    { name: 'Rust', id: 'sk-rust', evidence: [pev('create-py-app')] },
    { name: 'Go', id: 'sk-go', evidence: [pev('vs-file-split')] },
    { name: 'JavaScript/TypeScript (React, Next.js)', id: 'sk-js-ts', evidence: [
      ev('work', 'rs-prism', 1, 'Prism Controls'),
      ev('work', 'rs-consulting', 1, 'Consulting'),
      pev('wrike') ] },
    { name: 'C', id: 'sk-c', evidence: [
      { where: 'school', text: 'UMich coursework (EECS 280, 281, 370 notes)', href: '#rs-umich', source: 'UMich' } ] },
    { name: 'C++', id: 'sk-cpp', evidence: [
      { where: 'school', text: 'UMich coursework (EECS 280, 281, 370 notes)', href: '#rs-umich', source: 'UMich' } ] },
    plain('C#'),
  ] },
  { name: 'Infrastructure', skills: [
    { name: 'Networking', id: 'sk-networking', evidence: [
      ev('work', 'rs-kctc-work', 2, 'KCTC HelpDesk'),
      ev('work', 'rs-consulting', 3, 'Consulting'),
      ev('school', 'rs-kctc', 1, 'KCTC'),
      ev('school', 'rs-kctc', 2, 'KCTC') ] },
    { name: 'Cybersecurity', id: 'sk-cybersecurity', evidence: [
      ev('work', 'rs-consulting', 3, 'Consulting'),
      ev('school', 'rs-umich', 2, 'UMich'),
      ev('school', 'rs-kctc', 1, 'KCTC') ] },
    plain('Azure'),
    { name: 'Git (VCS)', id: 'sk-git-vcs', evidence: [
      ev('work', 'rs-prism', 3, 'Prism Controls'),
      ev('school', 'rs-umich', 1, 'UMich') ] },
    plain('Linux'),
    { name: 'CI/CD', id: 'sk-cicd', evidence: [
      ev('work', 'rs-prism', 3, 'Prism Controls'),
      pev('vs-file-split'),
      pev('create-py-app') ] },
    plain('Ansible'),
    plain('Terraform'),
  ] },
  { name: 'Principles', skills: [
    plain('Object-oriented programming & design (OOP/OOD)'),
    plain('RESTful APIs'),
    plain('SOLID'),
    plain('KISS'),
  ] },
  { name: 'Other', skills: [
    plain('Research'),
    plain('Data analysis'),
    { name: 'Configuration management', id: 'sk-configuration-management', evidence: [
      ev('work', 'rs-prism', 4, 'Prism Controls') ] },
    { name: 'System administration', id: 'sk-system-administration', evidence: [
      ev('work', 'rs-kctc-work', 1, 'KCTC HelpDesk'),
      ev('school', 'rs-grcc', 1, 'GRCC'),
      ev('school', 'rs-kctc', 1, 'KCTC') ] },
    plain('Technical documentation'),
  ] },
];
