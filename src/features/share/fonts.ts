/** Loads the card fonts before drawing. Never blocks sharing: after 3 s a system font is used. */
export const SANS = '"Inter Tight", Inter, Arial, sans-serif';
export const SERIF = '"Instrument Serif", Georgia, serif';

const TIMEOUT_MS = 3000;
let loading: Promise<void> | null = null;

async function loadAll(): Promise<void> {
  const serif = new FontFace(
    'Instrument Serif',
    `url(${import.meta.env.BASE_URL}fonts/InstrumentSerif-Italic.ttf)`,
    { style: 'italic', weight: '400' }
  );
  document.fonts.add(serif);
  const sample = 'GP 0123456789 ãéü·';
  const results = await Promise.all([
    serif.load().then(f => [f]),
    ...[300, 500, 800].map(w => document.fonts.load(`${w} 100px "Inter Tight"`, sample)),
  ]);
  // An empty list means no such font exists on the page: that is a failure too
  if (results.some(list => list.length === 0)) throw new Error('a card font is missing');
}

export function loadCardFonts(): Promise<void> {
  if (!loading) {
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timed out')), TIMEOUT_MS));
    loading = Promise.race([loadAll(), timeout]).catch(err => {
      console.warn('Card fonts not ready; using a system font', err);
      loading = null; // try again next time
    });
  }
  return loading;
}
