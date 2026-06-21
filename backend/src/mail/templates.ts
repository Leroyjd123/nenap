/**
 * Plain, on-brand HTML email templates. Inline styles only (email clients strip
 * <style>), calm palette matching the app. Each returns { subject, html }.
 */

const INK = '#2a2823';
const MUTED = '#6b6862';
const BG = '#faf8f2';
const SURFACE = '#fffdf8';
const ACCENT = '#6f7d57';
const LINE = '#e7e2d6';

interface Email {
  subject: string;
  html: string;
}

/** Shared shell: centred card on a calm background, with footer. */
function layout(bodyHtml: string): string {
  return `
  <div style="margin:0;padding:24px;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};">
    <div style="max-width:520px;margin:0 auto;background:${SURFACE};border:1px solid ${LINE};border-radius:14px;overflow:hidden;">
      <div style="padding:28px 32px 8px;">
        <div style="font-size:20px;font-weight:600;letter-spacing:-0.01em;color:${INK};">Nenap</div>
      </div>
      <div style="padding:8px 32px 28px;font-size:15px;line-height:1.6;color:${INK};">
        ${bodyHtml}
      </div>
    </div>
    <div style="max-width:520px;margin:14px auto 0;text-align:center;font-size:12px;color:${MUTED};">
      Nenap — focus on the moment. We remember the rest.
    </div>
  </div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;">${label}</a>`;
}

export function welcomeEmail(appUrl: string): Email {
  return {
    subject: 'Welcome to Nenap',
    html: layout(`
      <h1 style="font-size:21px;font-weight:600;margin:8px 0 12px;">Welcome — glad you're here.</h1>
      <p style="margin:0 0 14px;color:${MUTED};">
        Nenap is a calm place to capture what matters. Write notes naturally, and when you
        like, record alongside them — we'll quietly hand back a cleaner version while always
        keeping your original words.
      </p>
      <p style="margin:0 0 22px;color:${MUTED};">Start with a single note. That's all it takes.</p>
      <p style="margin:0 0 8px;">${button(appUrl, 'Open Nenap')}</p>
    `),
  };
}

export function processingFailedEmail(appUrl: string, noteTitle: string, noteId: string): Email {
  return {
    subject: "We couldn't finish improving your note",
    html: layout(`
      <h1 style="font-size:21px;font-weight:600;margin:8px 0 12px;">A note needs another try.</h1>
      <p style="margin:0 0 14px;color:${MUTED};">
        We ran into a problem while improving <strong style="color:${INK};">${escapeHtml(noteTitle)}</strong>.
        Your original note and recording are safe — nothing was lost.
      </p>
      <p style="margin:0 0 22px;color:${MUTED};">Open the note and tap <em>Retry</em> to try again.</p>
      <p style="margin:0 0 8px;">${button(`${appUrl}/notes/${noteId}`, 'Open the note')}</p>
    `),
  };
}

/** Minimal HTML escaping for user-supplied values interpolated into templates. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
