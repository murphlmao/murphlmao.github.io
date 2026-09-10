/* Resume data. Task 6 extends this file with education, skills and projects;
   the home rail (src/pages/index.astro) uses `experience`. */
export interface Entry { id: string; org: string; place: string; title: string; start: string; end: string; gpa?: string; bullets: string[]; note?: string }

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
