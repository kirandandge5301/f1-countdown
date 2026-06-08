import { useData } from '@/context/DataContext';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import PreviousRaceRecapCard from '@/components/PreviousRaceRecapCard';

export default function PreviousRaceSection() {
  const { previousRaceRecap, recapLoading } = useData();
  const [sectionRef, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.12 });

  if (!recapLoading && !previousRaceRecap) {
    return (
      <section
        ref={sectionRef}
        id="previous-race"
        className="px-[clamp(20px,5vw,64px)] pb-[clamp(60px,10vh,120px)] -mt-6 sm:-mt-10"
      >
        <div className="max-w-6xl mx-auto rounded-[32px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Previous Grand Prix</div>
          <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">Data currently unavailable.</p>
          <p className="mt-2 text-[var(--text-secondary)]">Verified recap details will appear again as soon as a completed round is available.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="previous-race"
      className="px-[clamp(20px,5vw,64px)] pb-[clamp(60px,10vh,120px)] -mt-6 sm:-mt-10"
    >
      <div className="max-w-6xl mx-auto">
        {recapLoading ? (
          <div className="rounded-[32px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 animate-pulse">
            <div className="h-5 w-40 rounded-full bg-[var(--bg-primary)]" />
            <div className="mt-5 h-12 w-72 rounded-2xl bg-[var(--bg-primary)]" />
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-40 rounded-3xl bg-[var(--bg-primary)]" />
              ))}
            </div>
          </div>
        ) : previousRaceRecap ? (
          <PreviousRaceRecapCard recap={previousRaceRecap} isVisible={isVisible} />
        ) : null}
      </div>
    </section>
  );
}
