import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy — Nenap',
  description: 'How Nenap collects, uses, and protects your notes and recordings.',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="21 June 2026">
      <p>
        Nenap helps you capture notes and, optionally, record audio that we turn into a cleaner,
        AI-enhanced note while always preserving your original words. This policy explains what we
        collect, why, and the choices you have. We keep it deliberately short and plain.
      </p>

      <h3>What we collect</h3>
      <ul>
        <li>
          <strong>Account details.</strong> Your email address and an encrypted password, handled by
          our authentication provider (Supabase). We never see or store your password in plain text.
        </li>
        <li>
          <strong>Your content.</strong> The notes you write, the folders and tags you create, and any
          audio you choose to record. Recordings are stored in private cloud storage.
        </li>
        <li>
          <strong>Derived content.</strong> Transcripts and enhanced versions of your notes that are
          generated when you record or tap “Improve”.
        </li>
        <li>
          <strong>Basic technical data.</strong> Standard server logs (such as request times and error
          diagnostics) needed to operate and secure the service.
        </li>
      </ul>

      <h3>How we use it</h3>
      <ul>
        <li>To provide the core product — storing, organising, and displaying your notes.</li>
        <li>
          To generate transcripts and enhanced notes. Audio and note text are sent to Google’s Gemini
          API for this purpose only, at the moment you record or request an improvement.
        </li>
        <li>To keep the service secure, debug problems, and prevent abuse.</li>
      </ul>
      <p>
        <strong>We do not sell your data, and we do not use your notes or recordings to train our own
        models.</strong>
      </p>

      <h3>Who we share it with</h3>
      <p>We rely on a small number of trusted infrastructure providers, acting on our instructions:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — authentication, database, and file storage.
        </li>
        <li>
          <strong>Google (Gemini API)</strong> — audio transcription and note enhancement. Per
          Google’s API terms, prompts and content submitted through the paid API are not used to train
          their models.
        </li>
        <li>
          <strong>Hosting providers</strong> (e.g. Vercel and Railway) that run the application.
        </li>
      </ul>
      <p>
        We may also disclose information if required by law, or to protect the rights and safety of
        our users and the service.
      </p>

      <h3>Retention &amp; deletion</h3>
      <p>
        Your content stays until you delete it. Deleting a note removes the note, its transcript,
        enhanced versions, and any associated recording file. You can request full account deletion at
        any time by emailing us, and we will remove your account and associated content.
      </p>

      <h3>Your choices</h3>
      <ul>
        <li>Recording is always optional — notes work fully without it.</li>
        <li>You can edit or delete any note, folder, tag, or recording at any time.</li>
        <li>You can request a copy of your data or its deletion by contacting us.</li>
      </ul>

      <h3>Security</h3>
      <p>
        Data is encrypted in transit. Recordings are kept in private storage and served only through
        short-lived, signed links. We restrict internal access to what’s needed to run the service.
        No system is perfectly secure, but we take reasonable measures to protect your information.
      </p>

      <h3>Children</h3>
      <p>
        Nenap is not directed at children under 13 (or the minimum age in your jurisdiction), and we do
        not knowingly collect their data.
      </p>

      <h3>Changes</h3>
      <p>
        We may update this policy as the product evolves. We’ll revise the “last updated” date above
        and, for material changes, give notice within the app.
      </p>

      <h3>Contact</h3>
      <p>
        Questions about privacy or your data? Email{' '}
        <a href="mailto:privacy@nenap.app">privacy@nenap.app</a>.
      </p>

      <p className="meta">
        This document is provided as a clear starting point and should be reviewed by legal counsel
        before public launch, including details specific to your operating entity and jurisdiction.
      </p>
    </LegalPage>
  );
}
