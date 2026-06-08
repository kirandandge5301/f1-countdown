import { ThemeProvider } from '@/context/ThemeContext';
import { TimezoneProvider } from '@/context/TimezoneContext';
import { DataProvider } from '@/context/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NextRaceSection from '@/sections/NextRaceSection';
import PreviousRaceSection from '@/sections/PreviousRaceSection';
import ScheduleSection from '@/sections/ScheduleSection';
import HowToWatchSection from '@/sections/HowToWatchSection';
import StandingsSection from '@/sections/StandingsSection';

function App() {
  return (
    <ThemeProvider>
      <TimezoneProvider>
        <DataProvider>
          <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
            <Header />
            <main>
              <NextRaceSection />
              <PreviousRaceSection />
              <ScheduleSection />
              <HowToWatchSection />
              <StandingsSection />
            </main>
            <Footer />
          </div>
        </DataProvider>
      </TimezoneProvider>
    </ThemeProvider>
  );
}

export default App;
