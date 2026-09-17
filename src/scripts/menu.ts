/* Mobile nav sheet (drops under the 56px bar) + its backdrop. Ported from
   docs/redesign-previews/r4/site.js (initMenu, lines 100-127), extended for
   the icon-only morphing button, a click-to-close backdrop, and focus
   management (open -> first nav link, close -> back to the menu button). */
export function initMenu(): void {
  const side = document.querySelector<HTMLElement>('.side');
  const menuBtn = document.querySelector<HTMLButtonElement>('.side__menuBtn');
  const panel = document.getElementById('sidepanel');
  const backdrop = document.querySelector<HTMLElement>('.side__backdrop');
  if (!side || !menuBtn || !panel) return;

  function closeMenu(returnFocus: boolean): void {
    side!.classList.remove('is-open');
    menuBtn!.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    if (returnFocus) menuBtn!.focus();
  }
  function openMenu(): void {
    side!.classList.add('is-open');
    menuBtn!.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    panel!.querySelector<HTMLElement>('a')?.focus();
  }

  menuBtn.addEventListener('click', () => {
    if (side.classList.contains('is-open')) closeMenu(true); else openMenu();
  });
  panel.addEventListener('click', (e) => {
    if ((e.target as Element | null)?.closest?.('a')) closeMenu(false);
  });
  backdrop?.addEventListener('click', () => closeMenu(true));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && side.classList.contains('is-open')) closeMenu(true);
  });
}
