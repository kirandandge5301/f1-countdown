import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useTimezone } from '@/context/TimezoneContext';
import { useData } from '@/context/DataContext';
import { TIMEZONE_OPTIONS } from '@/data/timezones';

const NAV_LINKS = [
  { label: 'next race', href: '#next-race' },
  { label: 'recap', href: '#previous-race' },
  { label: 'schedule', href: '#schedule' },
  { label: 'watch', href: '#how-to-watch' },
  { label: 'standings', href: '#standings' }
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { timezone, timezoneLabel, setTimezone } = useTimezone();
  const { seasonYear } = useData();
  const [tzOpen, setTzOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('next-race');
  const [scrolled, setScrolled] = useState(false);
  const tzRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map(l => l.href.slice(1));
    const observers: IntersectionObserver[] = [];

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (tzRef.current && !tzRef.current.contains(e.target as Node)) {
        setTzOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-[100] border-b border-[var(--border-subtle)] transition-colors duration-300 ${scrolled ? 'bg-[var(--bg-primary)]/95 backdrop-blur-md' : 'bg-[var(--bg-primary)]'}`}>
        <div className="flex items-center justify-between px-[clamp(20px,5vw,64px)] py-4">
          {/* Logo */}
          <button data-testid="header-logo-button" onClick={() => handleNavClick('#next-race')} className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#E10600]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">GPCountdown</span>
              <span className="text-[15px] text-[var(--text-secondary)]">{seasonYear}</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                data-testid={`header-nav-${link.label.replace(/\s+/g, '-')}`}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm transition-colors duration-200 capitalize ${
                  activeSection === link.href.slice(1) ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Timezone Selector */}
            <div ref={tzRef} className="relative">
              <button
                data-testid="timezone-selector-button"
                onClick={() => setTzOpen(!tzOpen)}
                aria-expanded={tzOpen}
                className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-w-[140px]"
              >
                <Globe size={15} />
                <span className="hidden sm:inline font-medium">{timezoneLabel}</span>
                <ChevronDown size={14} className={`ml-auto transition-transform ${tzOpen ? 'rotate-180' : ''}`} />
              </button>

              {tzOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl py-2 min-w-[260px] z-[200] shadow-xl max-h-[320px] overflow-auto">
                  {TIMEZONE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      data-testid={`timezone-option-${opt.value.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                      onClick={() => {
                        setTimezone(opt.value);
                        setTzOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm transition-colors hover:bg-[var(--row-hover)] flex justify-between items-center ${
                        timezone === opt.value ? 'text-[#E10600] bg-[rgba(225,6,0,0.08)]' : ''
                      }`}
                    >
                      <span>{opt.label}</span>
                      {timezone === opt.value && <span className="text-[#E10600]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              data-testid="theme-toggle-button"
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Mobile Menu */}
            <button
              data-testid="mobile-menu-open-button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-[var(--text-secondary)]"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[300] bg-[var(--bg-primary)] flex flex-col items-center justify-center">
          <button data-testid="mobile-menu-close-button" onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 text-[var(--text-secondary)]">
            <X size={28} />
          </button>
          <nav className="flex flex-col items-center gap-10 text-2xl">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                data-testid={`mobile-nav-${link.label.replace(/\s+/g, '-')}`}
                onClick={() => handleNavClick(link.href)}
                className="capitalize transition-colors hover:text-[#E10600]"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
