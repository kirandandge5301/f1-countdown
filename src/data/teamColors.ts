/**
 * Team colours, keyed by Jolpica constructorId (stable across sponsor/name changes).
 *
 * Neither Jolpica nor any other source the site uses provides team colours, so they
 * live here. They are decorative approximations of each team's livery (they colour
 * the ring around a driver's car number), not official brand values: adjust freely.
 *
 * A team that is missing gets a neutral grey ring and a console warning, so a new
 * team shows up as "add a colour here" rather than looking silently wrong.
 */
export const TEAM_COLORS: Record<string, string> = {
  red_bull: '#1E41FF',
  mclaren: '#FF8000',
  ferrari: '#DC0000',
  mercedes: '#27F4D2',
  aston_martin: '#006F62',
  williams: '#64C4FF',
  rb: '#6692FF',
  haas: '#B6BABD',
  alpine: '#FF87BC',
  sauber: '#52E252',
  audi: '#BB0A30',
  cadillac: '#C9B37E',
};

export const UNKNOWN_TEAM_COLOR = '#999999';

const warned = new Set<string>();

export function teamColor(constructorId: string | undefined): string {
  const color = constructorId ? TEAM_COLORS[constructorId] : undefined;
  if (color) return color;
  if (constructorId && !warned.has(constructorId)) {
    warned.add(constructorId);
    console.warn(`No team colour for constructor "${constructorId}": add it to src/data/teamColors.ts`);
  }
  return UNKNOWN_TEAM_COLOR;
}
