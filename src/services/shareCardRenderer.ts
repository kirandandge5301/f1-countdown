export type ShareCardFormat = 'x' | 'instagram';
export type ShareCardTheme = 'light' | 'dark';

export interface ShareCountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ShareCardData {
  raceName: string;
  circuitName: string;
  countdown: ShareCountdownParts;
  nextSession: string;
  sessionStart: string;
  raceWeekStatus: string;
  timezoneLabel: string;
  theme: ShareCardTheme;
  format: ShareCardFormat;
}

const CARD_SIZE: Record<ShareCardFormat, { width: number; height: number }> = {
  x: { width: 1600, height: 1000 },
  instagram: { width: 1080, height: 1920 },
};

function pad(value: number): string {
  return String(Math.max(0, value)).padStart(2, '0');
}

function palette(theme: ShareCardTheme) {
  if (theme === 'dark') {
    return {
      bg: '#050505',
      primary: '#F7F7F2',
      secondary: '#A9A9A2',
      tertiary: '#62625C',
      rule: '#242421',
    };
  }

  return {
    bg: '#F8F7F2',
    primary: '#090909',
    secondary: '#4B4B46',
    tertiary: '#8A8982',
    rule: '#D9D7CE',
  };
}

function font(weight: number, size: number, family = 'Inter Tight'): string {
  return `${weight} ${size}px "${family}", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    color: string;
    size: number;
    weight?: number;
    align?: CanvasTextAlign;
    family?: string;
    uppercase?: boolean;
    maxWidth?: number;
  },
): void {
  ctx.fillStyle = options.color;
  ctx.font = font(options.weight ?? 500, options.size, options.family);
  ctx.textAlign = options.align ?? 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(options.uppercase ? text.toUpperCase() : text, x, y, options.maxWidth);
}

function drawXCard(ctx: CanvasRenderingContext2D, data: ShareCardData): void {
  const colors = palette(data.theme);
  const { width, height } = CARD_SIZE.x;

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  drawText(ctx, data.raceName, 128, 172, {
    color: colors.primary,
    size: 72,
    weight: 600,
    maxWidth: 1080,
  });

  drawText(ctx, data.circuitName, 128, 230, {
    color: colors.tertiary,
    size: 26,
    weight: 500,
    uppercase: true,
    maxWidth: 920,
  });

  const rows = [
    [pad(data.countdown.days), 'Days'],
    [pad(data.countdown.hours), 'Hours'],
    [pad(data.countdown.minutes), 'Minutes'],
  ] as const;

  rows.forEach(([value, label], index) => {
    const y = 380 + index * 144;
    drawText(ctx, value, 128, y, {
      color: colors.primary,
      size: 118,
      weight: 500,
      family: 'SF Mono',
    });
    drawText(ctx, label, 370, y - 10, {
      color: colors.secondary,
      size: 42,
      weight: 500,
    });
  });

  drawText(ctx, `${data.nextSession} starts ${data.sessionStart}`, 128, 802, {
    color: colors.secondary,
    size: 34,
    weight: 500,
    maxWidth: 1000,
  });

  ctx.strokeStyle = colors.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(128, 864);
  ctx.lineTo(1472, 864);
  ctx.stroke();

  drawText(ctx, data.raceWeekStatus, 128, 922, {
    color: colors.primary,
    size: 30,
    weight: 600,
  });
  drawText(ctx, 'Every Second Matters.', 520, 922, {
    color: colors.secondary,
    size: 30,
    weight: 500,
  });
  drawText(ctx, 'GPCountdown', 1472, 922, {
    color: colors.primary,
    size: 30,
    weight: 700,
    align: 'right',
  });

  drawText(ctx, data.timezoneLabel, 1472, 172, {
    color: colors.tertiary,
    size: 24,
    weight: 600,
    align: 'right',
    uppercase: true,
  });
}

function drawInstagramCard(ctx: CanvasRenderingContext2D, data: ShareCardData): void {
  const colors = palette(data.theme);
  const { width, height } = CARD_SIZE.instagram;

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  const title = data.raceName.replace(/\s+Grand Prix$/i, '\nGrand Prix').toUpperCase();
  const titleLines = title.split('\n');
  titleLines.forEach((line, index) => {
    drawText(ctx, line, 96, 252 + index * 86, {
      color: colors.primary,
      size: 78,
      weight: 650,
      maxWidth: 890,
    });
  });

  drawText(ctx, data.circuitName, 96, 438, {
    color: colors.tertiary,
    size: 24,
    weight: 600,
    uppercase: true,
    maxWidth: 760,
  });

  const values = [
    [pad(data.countdown.days), 'Days'],
    [pad(data.countdown.hours), 'Hours'],
    [pad(data.countdown.minutes), 'Mins'],
    [pad(data.countdown.seconds), 'Secs'],
  ] as const;

  values.forEach(([value, label], index) => {
    const y = 690 + index * 198;
    drawText(ctx, value, 96, y, {
      color: colors.primary,
      size: 162,
      weight: 500,
      family: 'SF Mono',
    });
    drawText(ctx, label, 488, y - 30, {
      color: colors.secondary,
      size: 38,
      weight: 500,
    });
  });

  ctx.strokeStyle = colors.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(96, 1512);
  ctx.lineTo(984, 1512);
  ctx.stroke();

  drawText(ctx, data.raceWeekStatus, 96, 1606, {
    color: colors.primary,
    size: 42,
    weight: 600,
  });
  drawText(ctx, `${data.nextSession} - ${data.sessionStart}`, 96, 1666, {
    color: colors.secondary,
    size: 28,
    weight: 500,
    maxWidth: 800,
  });
  drawText(ctx, 'Every Second Matters.', 96, 1762, {
    color: colors.secondary,
    size: 32,
    weight: 500,
  });
  drawText(ctx, 'GPCountdown', 96, 1818, {
    color: colors.primary,
    size: 42,
    weight: 700,
  });
  drawText(ctx, data.timezoneLabel, 984, 1818, {
    color: colors.tertiary,
    size: 24,
    weight: 600,
    align: 'right',
    uppercase: true,
  });
}

export async function renderShareCard(data: ShareCardData): Promise<string> {
  if (document.fonts) {
    await document.fonts.ready;
  }

  const canvas = document.createElement('canvas');
  const size = CARD_SIZE[data.format];
  canvas.width = size.width;
  canvas.height = size.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas rendering is not available.');
  }

  if (data.format === 'x') {
    drawXCard(ctx, data);
  } else {
    drawInstagramCard(ctx, data);
  }

  return canvas.toDataURL('image/png');
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
