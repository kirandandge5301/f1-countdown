import { lazy, Suspense } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { TimezoneProvider } from '@/context/TimezoneContext';
import { DataProvider } from '@/context/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NextRaceSection from '@/sections/NextRaceSection';
import PlaylistSection from '@/features/playlist/PlaylistSection';
import ScheduleSection from '@/sections/ScheduleSection';
import HowToWatchSection from '@/sections/HowToWatchSection';
import StandingsSection from '@/sections/StandingsSection';

// Unlisted preview page for Kiran, at /?studio. Loaded only when asked for.
const Studio = lazy(() => import('@/features/share/Studio'));
const isStudio = new URLSearchParams(window.location.search).has('studio');

function App() {
  return (
    <ThemeProvider>
      <TimezoneProvider>
        <DataProvider>
          <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
            <Header />
            <main>
              {isStudio ? (
                <Suspense fallback={null}>
                  <Studio />
                </Suspense>
              ) : (
                <>
                  <NextRaceSection />
                  <PlaylistSection />
                  <ScheduleSection />
                  <HowToWatchSection />
                  <StandingsSection />
                </>
              )}
            </main>
            <Footer />
          </div>
        </DataProvider>
      </TimezoneProvider>
    </ThemeProvider>
  );
}

export default App;
