import { useState, useEffect } from 'react';
import { GiDeer } from 'react-icons/gi';

interface NavbarProps {
  pathname: string;
}

export default function Navbar({ pathname }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Check if deer page is active
  const isDeerActive = pathname.startsWith('/deer');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
        setIsMenuOpen(false); // Close menu when scrolling down
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('nav')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const isLight = document.documentElement.classList.contains('dark') === false;
    setIsDark(!isLight);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const navLinks = [
    { name: 'Home', href: '/', isActive: pathname === '/' },
    { name: 'Articles', href: '/articles', isActive: pathname.startsWith('/articles') },
    { name: 'Snippets', href: '/snippets', isActive: pathname.startsWith('/snippets') },
    { name: 'Resources', href: '/resources', isActive: pathname.startsWith('/resources') },
    { name: 'Projects', href: '/projects', isActive: pathname.startsWith('/projects') },
  ];

  return (
    <>
      <div
        className={`fixed inset-x-0 top-0 z-50 transform transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <nav className="pb-4 pt-6 sm:pt-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mx-auto lg:max-w-5xl">
              {/* Mobile Menu Button - Left side on mobile */}
              <div className="sm:hidden">
                <button
                  onClick={toggleMenu}
                  className="group flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10 dark:hover:ring-white/20 cursor-pointer"
                  type="button"
                  aria-expanded={isMenuOpen}
                >
                  Menu
                  <svg
                    viewBox="0 0 8 6"
                    aria-hidden="true"
                    className={`ml-2 h-auto w-2 stroke-zinc-500 group-hover:stroke-zinc-700 dark:group-hover:stroke-zinc-400 transition-transform duration-200 ${
                      isMenuOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <path
                      d="M1.75 1.75 4 4.25l2.25-2.5"
                      fill="none"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Desktop placeholder for layout balance */}
              <div className="hidden sm:flex items-center"></div>

              {/* Centered Desktop Menu */}
              <div className="hidden sm:block rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-900/90 dark:text-zinc-200 dark:ring-white/10">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="relative rounded-lg px-3 inline-block py-2 text-sm transition-all delay-150 cursor-pointer"
                  >
                    <span
                      className={`relative z-10 ${
                        link.isActive
                          ? 'text-sky-500 dark:text-sky-400'
                          : 'text-gray-600 dark:text-gray-50'
                      }`}
                    >
                      {link.name}
                    </span>
                    {link.isActive && (
                      <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-sky-500/0 via-sky-500/40 to-sky-500/0 dark:from-sky-400/0 dark:via-sky-400/40 dark:to-sky-400/0" />
                    )}
                  </a>
                ))}
              </div>

              {/* Deer Icon and Dark Mode Toggle - Right side */}
              <div className="flex items-center gap-2 sm:gap-4">
                <a
                  href="/deer"
                  className={`relative cursor-pointer rounded-full p-2 transition-colors focus:outline-none ${
                    isDeerActive
                      ? 'text-sky-500 dark:text-sky-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                  aria-label="murphy's pain"
                  title="Tragedy & Pain."
                >
                  <GiDeer className="w-5 h-5" />
                  {isDeerActive && (
                    <span className="absolute inset-x-1 -bottom-1 h-px bg-gradient-to-r from-sky-500/0 via-sky-500/70 to-sky-500/0 dark:from-sky-400/0 dark:via-sky-400/70 dark:to-sky-400/0" />
                  )}
                </a>
                <button
                  onClick={toggleDarkMode}
                  className="cursor-pointer rounded-full p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {isDark ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 sm:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute inset-x-4 top-24 rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-zinc-900/10 dark:bg-zinc-900 dark:ring-zinc-800 transform transition-all duration-300 ${
            isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <nav className="mt-2">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      link.isActive
                        ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                        : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              {/* Deer link in mobile menu */}
              <li>
                <a
                  href="/deer"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                    isDeerActive
                      ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                      : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <GiDeer className="w-5 h-5" />
                  Tragedy & Pain
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
