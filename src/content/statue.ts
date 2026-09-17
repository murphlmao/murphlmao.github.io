/* The statue rooms: twelve black rooms, each one animated gif that links to the next,
   with a hidden looping track. Rebuilt from the fauux.neocities.org/statue pages
   (art by fauux; the gifs live in public/statue, named <room>-<what>.gif). All twelve render on one page,
   pages/transcend/statue.astro, which swaps rooms in place (#n deep-links one).
   pages/transcend/index.astro is the coming-soon page in front of it.

   `css` is the figure's exact placement, kept as the literal rules the originals used
   so a page can be checked against its source at a glance. */

export interface StatuePage {
  n: number;                 // 1..12; /transcend/statue#<n> opens that room
  gif: string;               // file in public/statue
  w: number; h: number;      // the gif's rendered box
  css: string;               // placement of the figure box
  music: string;             // YouTube id, looped in a 0x0 iframe like the originals
  behind?: boolean;          // figure sits under the page's other content (10)
  backdrop?: 'pines' | 'rgb' | 'clouds';
  marquee?: string[];        // 10: lines scrolling up the right side, inside the link
}

/** The seven turning cloud layers behind 12's head, back to front is 7..1. */
export const clouds = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ n, src: `/statue/12-cloud-${n}.gif`, seconds: n * 10 + 10 }));

/** 9's four pine bands sliding sideways at different speeds, back to front. */
export const pines = [
  { src: '/statue/09-pines-4.gif', seconds: 240 },
  { src: '/statue/09-pines-3.gif', seconds: 120 },
  { src: '/statue/09-pines-2.gif', seconds: 60 },
  { src: '/statue/09-pines-1.gif', seconds: 30 },
];

const center = (w: number, h: number, fixed = false, dy = -h / 2) =>
  `position:${fixed ? 'fixed' : 'absolute'};top:50%;left:50%;margin-top:${dy}px;margin-left:${-w / 2}px`;

export const statues: StatuePage[] = [
  { n: 1, gif: '01-bust.gif', w: 720, h: 1080, css: 'position:absolute;bottom:0;left:35%;margin-bottom:-200px;margin-left:-360px', music: 'v7mfaZo6d_M' },
  { n: 2, gif: '02-bust-ii.gif', w: 720, h: 1080, css: 'position:absolute;bottom:0;right:0;margin-bottom:-200px', music: 'JKQwgpaLR6o' },
  { n: 3, gif: '03-greek-statue.gif', w: 720, h: 1080, css: 'position:absolute;bottom:0;left:0', music: 'kmrr2HUNEwo' },
  { n: 4, gif: '04-face.gif', w: 651, h: 1080, css: 'position:absolute;bottom:0;left:0;margin-bottom:-200px', music: 'GaT2z0hF4N8' },
  { n: 5, gif: '05-marble.gif', w: 669, h: 1080, css: center(669, 1080, true), music: 'fzYUBIdDb4I' },
  { n: 6, gif: '06-glitch.gif', w: 555, h: 720, css: center(555, 720), music: 'COspp0tiPn8' },
  { n: 7, gif: '07-mary.gif', w: 618, h: 900, css: center(618, 900), music: '2ICFtXx546A' },
  { n: 8, gif: '08-woman.gif', w: 673, h: 900, css: 'position:absolute;bottom:0;right:0', music: 'TWm0zameTCY' },
  { n: 9, gif: '09-lined-bust.gif', w: 643, h: 900, css: center(643, 900, true), music: 'Hxi7EZf_HYA', backdrop: 'pines' },
  { n: 10, gif: '10-blink.gif', w: 762, h: 1062, css: 'position:fixed;top:50%;left:40%;margin-top:-531px;margin-left:-381px', music: 'QwOU3bnuU0k', behind: true,
    marquee: [
      '--------------------', 'Technology', 'isn\u2019t what', 'makes us', '\u201cpost-human\u201d or', '\u201ctranshuman\u201d.', '',
      'It\u2019s what', 'makes us human.', '', 'Technology', 'is in our', 'nature.', '', 'Through our', 'tools we', 'give our', 'dreams form.', '',
      'We bring', 'them into', 'the world.', '', 'The', 'practicality', 'of technology', 'may distinguish', 'it from art,', 'but both', 'spring from',
      'a similar,', 'distinctly', 'human', 'yearning.', '', '--------------------', 'The cyberspace', 'will be', 'inhabited by', 'transformed', 'Exes,',
      'moving and', 'growing with', 'a freedom', 'impossible', 'for physical', 'entities.', '', 'A good,', 'or merely', 'convincing,', 'idea,',
      'or an entire', 'personality,', 'may spread to', 'neighbors at', 'the speed', 'of light.', '', 'Boundaries', 'of personal', 'identity will',
      'be very fluid,', 'and ultimately', 'arbitrary', 'and subjective,', 'as', 'strong and weak', 'interconnections', 'between', 'different regions',
      'rapidly', 'form and dissolve.', '', 'Yet some', 'boundaries', 'will persist,', 'due to distance,', 'incompatible', 'ways of thought,',
      'and deliberate choice.', '', 'The consequent', 'competitive', 'diversity', 'will allow a', 'Darwinian evolution', 'to continue,',
      'weeding out', 'ineffective ways', 'of thought,', 'and fostering', 'a continuing novelty.',
    ] },
  { n: 11, gif: '11-hand.gif', w: 480, h: 648, css: center(480, 648, true), music: 'SLxrrE6wC5I', backdrop: 'rgb' },
  { n: 12, gif: '12-head.gif', w: 424, h: 584, css: center(424, 584, true, -220), music: '_V-b8QIYOpM', backdrop: 'clouds' },
];

/** Where a page's figure leads: the next room, and the last one back to the first. */
export const nextOf = (n: number) => (n % statues.length) + 1;
