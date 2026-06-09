export type ShareEventName = 'x_share' | 'instagram_story_download' | 'share_card_download';

export interface ShareAnalyticsPayload {
  format: 'x' | 'instagram';
  raceName: string;
  sessionName: string;
  theme: 'light' | 'dark';
}

export function trackShareEvent(eventName: ShareEventName, payload: ShareAnalyticsPayload): void {
  if (typeof window === 'undefined') return;

  const event = {
    eventName,
    payload,
    timestamp: new Date().toISOString(),
  };

  window.dispatchEvent(new CustomEvent('gpcountdown:share', { detail: event }));

  if (import.meta.env.DEV) {
    console.info('[GPCountdown analytics]', event);
  }
}
