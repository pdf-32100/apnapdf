import LegalPage, { Section } from "../components/LegalPage.jsx";
import { useSite } from "../context/SiteContext.jsx";

export default function Privacy() {
  const { settings } = useSite();
  const name = settings.siteName || "PrintWala";

  return (
    <LegalPage
      title="Privacy Policy"
      updated="12 September 2026"
      intro={`Your privacy matters to us. This policy explains what information ${name} collects, how we use it, and the choices you have. By using our website you agree to the practices described here.`}
    >
      <Section n={1} title="Information we collect">
        <ul>
          <li><strong>Account details</strong> — your name, email and phone number when you register or place an order.</li>
          <li><strong>Order details</strong> — the services you book, the options you choose, and any notes you provide.</li>
          <li><strong>Uploaded files</strong> — documents, images or PDFs you upload so we can complete your order.</li>
          <li><strong>Payment information</strong> — handled directly by our payment partner (Razorpay). We receive confirmation of payment but <strong>never see or store</strong> your full card, UPI or bank details.</li>
          <li><strong>Usage data</strong> — basic technical information (like your browser type and pages visited) to keep the site working and secure.</li>
        </ul>
      </Section>

      <Section n={2} title="How we use your information">
        <ul>
          <li>To process, produce and deliver your orders.</li>
          <li>To send you order confirmations and updates.</li>
          <li>To respond to your enquiries and provide customer support.</li>
          <li>To operate, secure and improve our website and services.</li>
          <li>To meet legal or accounting obligations.</li>
        </ul>
        <p>We do <strong>not</strong> sell your personal information to anyone.</p>
      </Section>

      <Section n={3} title="Your uploaded files">
        <p>
          Files you upload are used solely to fulfil your order. We store them securely, share them only with the team
          members who produce your order, and remove them once they are no longer needed for your order or our
          record-keeping. Please avoid uploading sensitive information that isn't required for your order.
        </p>
      </Section>

      <Section n={4} title="Payments">
        <p>
          Online payments are processed by <strong>Razorpay</strong>, a third-party payment gateway. Your payment
          details are entered on their secure systems and are governed by their own privacy policy. {name} only
          receives the result of the transaction (success/failure) and a reference id.
        </p>
      </Section>

      <Section n={5} title="Sharing with third parties">
        <p>We share information only as needed to run the service, including with:</p>
        <ul>
          <li>our payment provider (Razorpay) to process payments;</li>
          <li>delivery partners, where you choose delivery, to get your order to you;</li>
          <li>hosting and infrastructure providers that run our website and database;</li>
          <li>authorities, where required by law.</li>
        </ul>
      </Section>

      <Section n={6} title="Cookies & local storage">
        <p>
          We use your browser's local storage to keep you signed in and to remember small preferences. These are used
          only to make the site work — we don't use them to track you across other websites.
        </p>
      </Section>

      <Section n={7} title="Data retention">
        <p>
          We keep account and order information for as long as your account is active or as needed to provide the
          service and comply with legal obligations. Uploaded files are removed once they are no longer needed for your
          order. You can ask us to delete your account at any time (see section 8).
        </p>
      </Section>

      <Section n={8} title="Your rights">
        <p>You can ask us to:</p>
        <ul>
          <li>access the personal information we hold about you;</li>
          <li>correct information that is inaccurate;</li>
          <li>delete your account and associated personal data, subject to legal record-keeping requirements.</li>
        </ul>
        <p>To make a request, contact us using the details below.</p>
      </Section>

      <Section n={9} title="Security">
        <p>
          We take reasonable technical and organisational measures to protect your information, including encrypted
          connections (HTTPS) and secure handling of payments. No system is perfectly secure, but we work to keep your
          data safe.
        </p>
      </Section>

      <Section n={10} title="Children's privacy">
        <p>
          Our services are intended for users aged 18 and over. We do not knowingly collect personal information from
          children.
        </p>
      </Section>

      <Section n={11} title="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. The latest version will always be here, with the "last
          updated" date shown above.
        </p>
      </Section>

      <Section n={12} title="Contact us">
        <ul>
          {settings.email && <li>Email: <a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
          {settings.phone && <li>Phone: {settings.phone}</li>}
          {settings.address && <li>Address: {settings.address}</li>}
        </ul>
      </Section>
    </LegalPage>
  );
}
