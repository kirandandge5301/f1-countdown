import { ThemeProvider } from '@/context/ThemeContext';
import { TimezoneProvider } from '@/context/TimezoneContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NextRaceSection from '@/sections/NextRaceSection';
import ScheduleSection from '@/sections/ScheduleSection';
import HowToWatchSection from '@/sections/HowToWatchSection';
import StandingsSection from '@/sections/StandingsSection';

function App() {
  return (
    <ThemeProvider>
      <TimezoneProvider>
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
          <Header />
          <main>
            <NextRaceSection />
            <ScheduleSection />
            <HowToWatchSection />
            <StandingsSection />
          </main>
          <Footer />
        </div>
      </TimezoneProvider>
    </ThemeProvider>
  );
}

export default App;
