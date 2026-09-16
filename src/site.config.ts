export type Palette = 'ember' | 'alley' | 'space';
export type Logo = 'orb' | 'mark-a' | 'mark-b' | 'mark-c';
export type Draw = 'pen' | 'laser';
export type Mich = 'maize' | 'accent' | 'muted';

export interface Tweaks {
  palette: Palette;
  logo: Logo;
  mich: Mich;
  draw: Draw;
  orb: 0 | 1;
  bg: 0 | 1;
  bgOpacity: number; // 0..100
  strands: 0 | 1;
  motes: 0 | 1;
  bgDim: number; // 0..100, multiplier on article pages
  paws: 0 | 1;
  walker: 0 | 1;
  deer: 0 | 1;
  raccoon: 0 | 1;
}

export const tweakDefaults: Tweaks = {
  palette: 'ember', logo: 'orb', mich: 'maize', draw: 'pen',
  orb: 1, bg: 1, bgOpacity: 25, strands: 1, motes: 1, bgDim: 50,
  paws: 0, walker: 1, deer: 1, raccoon: 1,
};

export const palettes: Palette[] = ['ember', 'alley', 'space'];
export const logos: Logo[] = ['orb', 'mark-a', 'mark-b', 'mark-c'];

/** Set false to remove the gear button and the settings popover from the site. */
export const showTweaks = true;

export const site = {
  name: 'Murphy Malcolm',
  domain: 'murph.rip',
  url: 'https://murph.rip',
  intro: 'Software & platform engineer. CS student at the University of Michigan.',
  socials: [
    { name: 'GitHub', href: 'https://github.com/murphlmao' },
    { name: 'Spotify', href: 'https://open.spotify.com/user/bigseeexyman' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/murphymalcolm/' },
    { name: 'Instagram', href: 'https://instagram.com/murphlmao' },
  ],
  nav: [
    { name: 'Home', href: '/' },
    { name: 'Articles', href: '/articles' },
    { name: 'Resources', href: '/resources' },
    { name: 'Resume', href: '/resume' },
  ],
  resumePdf: '/Murphy%20Malcolm%20-%20Resume%20(Public).pdf',
};
