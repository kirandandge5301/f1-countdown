import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useTimezone } from '@/context/TimezoneContext';
import { TIMEZONE_OPTIONS } from '@/data/timezones';

const NAV_LINKS = [
  { label: 'Next Race', href: '#next-race' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'How to Watch', href: '#how-to-watch' },
  { label: 'Standings', href: '#standings' }
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { timezone, timezoneLabel, setTimezone } = useTimezone();
  const [tzOpen, setTzOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('next-race');
  const [scrolled, setScrolled] = useState(false);
  const tzRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
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
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
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
      <header
        className={`sticky top-0 z-[100] border-b border-[var(--border-subtle)] transition-colors duration-300 ${
          scrolled ? 'bg-[var(--bg-primary)]/95 backdrop-blur-md' : 'bg-[var(--bg-primary)]'
        }`}
      >
        <div className="flex items-center justify-between px-[clamp(20px,5vw,64px)] py-4">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('#next-race')}
            className="flex items-center gap-2 shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-[#E10600]" />
            <span className="text-lg font-bold text-[var(--text-primary)]">GPCountdown</span>
            <span className="text-lg font-normal text-[var(--text-secondary)] tracking-[0.08em]">/ 2026</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm transition-colors duration-200 ${
                  activeSection === link.href.slice(1)
                    ? 'text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: Timezone + Theme */}
          <div className="flex items-center gap-3">
            {/* Timezone Selector */}
            <div ref={tzRef} className="relative">
              <button
                onClick={() => setTzOpen(!tzOpen)}
                className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Globe size={14} />
                <span className="hidden sm:inline">{timezoneLabel}</span>
                <ChevronDown size={12} className={`transition-transform ${tzOpen ? 'rotate-180' : ''}`} />
              </button>

              {tzOpen && (
                <div className="absolute right-0 top-[calc(100%+4px)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-2 min-w-[200px] z-[200] shadow-lg">
                  {TIMEZONE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setTimezone(opt.value); setTzOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[13px] transition-colors hover:bg-[var(--row-hover)] ${
                        timezone === opt.value ? 'text-[#E10600] font-medium' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-[var(--text-secondary)]"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[300] bg-[var(--bg-primary)] flex flex-col items-center justify-center animate-fade-in">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-[clamp(20px,5vw,64px)] text-[var(--text-secondary)]"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          <nav className="flex flex-col items-center gap-8">
            {NAV_LINKS.map((link, i) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-2xl font-medium text-[var(--text-primary)] hover:text-[var(--accent-red)] transition-colors animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
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
