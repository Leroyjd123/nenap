import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Terms of Service — Nenap',
  description: 'The terms that govern your use of Nenap.',
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="21 June 2026">
      <p>
        These terms govern your use of Nenap (“the service”). By creating an account or using the
        service, you agree to them. If you don’t agree, please don’t use Nenap.
      </p>

      <h3>Your account</h3>
      <ul>
        <li>You must provide an accurate email address and keep your login credentials secure.</li>
        <li>You’re responsible for activity that happens under your account.</li>
        <li>You must be old enough to form a binding contract in your jurisdiction.</li>
      </ul>

      <h3>Your content</h3>
      <p>
        You own the notes, recordings, and other content you create. You grant us only the limited
        permission needed to operate the service for you — to store, process, transcribe, and enhance
        your content, and to display it back to you. We don’t claim ownership of your content and we
        don’t use it to train our own models.
      </p>
      <p>
        You’re responsible for the content you capture, including having the right to record any audio
        you upload. Don’t use Nenap to store or process content that is unlawful, infringing, or that
        you don’t have permission to record.
      </p>

      <h3>AI-enhanced notes</h3>
      <p>
        Transcripts and enhanced notes are generated automatically using third-party AI (Google
        Gemini). They aim to preserve your meaning but may contain errors or omissions. Your original
        note is always preserved and never overwritten. Review AI-generated output before relying on
        it; it is not professional advice.
      </p>

      <h3>Acceptable use</h3>
      <ul>
        <li>Don’t misuse, disrupt, or attempt to gain unauthorised access to the service.</li>
        <li>Don’t use the service to violate the law or the rights of others.</li>
        <li>Don’t attempt to reverse-engineer, resell, or overload the service.</li>
      </ul>

      <h3>Availability &amp; changes</h3>
      <p>
        We work to keep Nenap available and reliable, but the service is provided “as is” without
        guarantees of uninterrupted availability. We may add, change, or remove features, and we may
        update these terms; for material changes we’ll give notice within the app and update the date
        above.
      </p>

      <h3>Termination</h3>
      <p>
        You can stop using Nenap and delete your account at any time. We may suspend or terminate
        access if these terms are breached or to protect the service and its users. On account
        deletion, your content is removed as described in the{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h3>Disclaimers &amp; liability</h3>
      <p>
        To the maximum extent permitted by law, Nenap is provided without warranties of any kind, and
        we are not liable for indirect, incidental, or consequential damages, or for loss of data
        arising from your use of the service. Keep your own copies of anything critical.
      </p>

      <h3>Contact</h3>
      <p>
        Questions about these terms? Email <a href="mailto:hello@nenap.app">hello@nenap.app</a>.
      </p>

      <p className="meta">
        This document is provided as a clear starting point and should be reviewed by legal counsel
        before public launch, including the governing-law and liability clauses specific to your
        operating entity and jurisdiction.
      </p>
    </LegalPage>
  );
}
