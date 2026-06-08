import type { RaceWeekend } from '@/services/openf1';

interface RaceInsightProps {
  race: RaceWeekend | null;
  isVisible: boolean;
}

export default function RaceInsight({ race, isVisible }: RaceInsightProps) {
  void race;
  void isVisible;
  return null;
}
