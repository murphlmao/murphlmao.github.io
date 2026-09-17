type Palette = 'ember' | 'alley' | 'space';
type Logo = 'orb' | 'mark-a' | 'mark-b' | 'mark-c';
type Draw = 'pen' | 'laser';
type Mich = 'maize' | 'accent' | 'muted';

export interface Tweaks {
  palette: Palette;
  logo: Logo;
  mich: Mich;
  draw: Draw;
  penSpeed: number; // 25..300, percent of the base trace speed, pen mode
  laserSpeed: number; // 25..300, same for laser (its trace, pause and finish all scale)
  glowBreathe: 0 | 1; // laser: the finished drawing pulses now and then
  glowStrength: number; // 0..100, laser glow intensity
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
  palette: 'ember', logo: 'orb', mich: 'maize', draw: 'laser',
  penSpeed: 85, laserSpeed: 135, glowBreathe: 1, glowStrength: 30,
  orb: 1, bg: 1, bgOpacity: 56, strands: 1, motes: 1, bgDim: 50,
  paws: 0, walker: 0, deer: 0, raccoon: 0,
};

export const palettes: Palette[] = ['ember', 'alley', 'space'];
export const logos: Logo[] = ['orb', 'mark-a', 'mark-b', 'mark-c'];

/** Set false to remove the gear button and the settings popover from the site. */
export const showTweaks = true;

export const site = {
  name: 'Murphy Malcolm',
  domain: 'murph.rip',
  url: 'https://murph.rip',
  /** Sidebar lines under the name: what he does, then what he studies. */
  roles: [
    { title: 'Software, Systems, & Platform Engineer', at: 'Prism Controls' },
    { title: 'CS & SOC Student', at: 'the University of Michigan, Ann Arbor' },
  ],
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
