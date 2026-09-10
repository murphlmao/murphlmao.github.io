/* Mobile sidebar sheet. Ported from docs/redesign-previews/r4/site.js
   (initMenu, lines 100-127). */
export function initMenu(): void {
  const side = document.querySelector<HTMLElement>('.side');
  const menuBtn = document.querySelector<HTMLButtonElement>('.side__menu');
  const panel = document.getElementById('sidepanel');
  if (!side || !menuBtn || !panel) return;

  function closeMenu(): void {
    side!.classList.remove('is-open');
    menuBtn!.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }
  function openMenu(): void {
    side!.classList.add('is-open');
    menuBtn!.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
  }

  menuBtn.addEventListener('click', () => {
    if (side.classList.contains('is-open')) closeMenu(); else openMenu();
  });
  panel.addEventListener('click', (e) => {
    if ((e.target as Element | null)?.closest?.('a')) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}
