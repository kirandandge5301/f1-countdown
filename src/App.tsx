import { ThemeProvider } from '@/context/ThemeContext';
import { TimezoneProvider } from '@/context/TimezoneContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NextRaceSection from '@/sections/NextRaceSection';
import ScheduleSection from '@/sections/ScheduleSection';
import HowToWatchSection from '@/sections/HowToWatchSection';
import StandingsSection from '@/sections/StandingsSection';
import { useEffect } from 'react';
import { fetchCurrentSchedule } from './f1api';
function App() {useEffect(() => {
  fetchCurrentSchedule()
  .then(data => {
    console.log('F1 API:', data);

    const races = data.MRData.RaceTable.Races;

    console.log('FIRST RACE:', races[0]);
    console.log('LAST RACE:', races[races.length - 1]);
  })
    .catch(error => {
      console.error(error);
    });
}, []);
  return (
    <ThemeProvider>
      <TimezoneProvider>
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">ō
      
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
