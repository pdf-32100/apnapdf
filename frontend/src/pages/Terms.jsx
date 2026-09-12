import LegalPage, { Section } from "../components/LegalPage.jsx";
import { useSite } from "../context/SiteContext.jsx";

export default function Terms() {
  const { settings } = useSite();
  const name = settings.siteName || "PrintWala";

  return (
    <LegalPage
      title="Terms & Conditions"
      updated="12 September 2026"
      intro={`Welcome to ${name}. These Terms & Conditions govern your use of our website and the printing, design and documentation services we provide. By using our site or placing an order, you agree to these terms.`}
    >
      <Section n={1} title="Who we are">
        <p>
          {name} ("we", "us", "our") is an online storefront for everyday print, design and documentation
          services — including photocopying, PDF printing, passport photos, lamination, resume and business-card
          design, and related paperwork assistance. You can reach us using the details at the bottom of this page.
        </p>
      </Section>

      <Section n={2} title="Your account">
        <p>
          You can browse and place orders as a guest, or create an account to track your orders. When you create an
          account you agree to provide accurate information and to keep your login credentials confidential. You are
          responsible for activity that happens under your account.
        </p>
      </Section>

      <Section n={3} title="Placing an order">
        <ul>
          <li>Select a service, complete the booking form, upload any required files, and pay online to confirm your order.</li>
          <li>An order is only confirmed once payment has been successfully received and you see an order confirmation.</li>
          <li>We may refuse or cancel an order if the request is unclear, the uploaded file is unusable, the content is prohibited (see section 7), or the item is unavailable. In such cases any amount paid will be refunded.</li>
        </ul>
      </Section>

      <Section n={4} title="Pricing & payments">
        <ul>
          <li>All prices are listed in Indian Rupees (₹) and, unless stated otherwise, are inclusive of applicable taxes.</li>
          <li>The final amount depends on the options you choose (such as quantity, colour, paper size or finish).</li>
          <li>Payments are processed securely by our payment partner, <strong>Razorpay</strong>. We do not receive or store your full card, UPI or banking details.</li>
          <li>We make every effort to display accurate pricing, but if an obvious error occurs we will contact you before processing the order.</li>
        </ul>
      </Section>

      <Section n={5} title="Your files & content">
        <ul>
          <li>You keep all ownership of the files and content you upload. You grant us a limited licence to store, print, process and reproduce them solely to fulfil your order.</li>
          <li>You confirm that you have the right to print and reproduce anything you upload, and that it does not infringe anyone else's copyright, trademark or other rights.</li>
          <li>You are responsible for checking your files (spelling, layout, resolution and colour) before submitting. We print what you provide.</li>
        </ul>
      </Section>

      <Section n={6} title="Turnaround, pickup & delivery">
        <ul>
          <li>Turnaround times shown on the site are estimates and may vary with order size and demand.</li>
          <li>Depending on the service, orders can be collected in store or delivered. We'll let you know when your order is ready.</li>
          <li>We are not responsible for delays caused by circumstances beyond our reasonable control.</li>
        </ul>
      </Section>

      <Section n={7} title="Acceptable use & prohibited content">
        <p>You agree not to upload or ask us to print anything that:</p>
        <ul>
          <li>is illegal, fraudulent, or infringes someone else's intellectual property;</li>
          <li>reproduces currency, government IDs, certificates or documents for unlawful purposes;</li>
          <li>is defamatory, obscene, hateful, or otherwise objectionable.</li>
        </ul>
        <p>We may refuse any order that breaches this policy.</p>
      </Section>

      <Section n={8} title="Cancellations, refunds & reprints">
        <ul>
          <li>Because most orders are custom-produced for you, they generally cannot be cancelled once production has started.</li>
          <li>If your order arrives <strong>defective, damaged, or materially different</strong> from what you ordered, contact us promptly and we will reprint it or refund you.</li>
          <li>We cannot refund issues caused by mistakes in the files you supplied (for example typos or low-resolution images).</li>
        </ul>
      </Section>

      <Section n={9} title="Intellectual property">
        <p>
          The {name} name, logo, website design, text and graphics are owned by us and may not be copied or reused
          without permission. This does not affect ownership of the files you upload, which remain yours.
        </p>
      </Section>

      <Section n={10} title="Limitation of liability">
        <p>
          Our services are provided on a reasonable-effort basis. To the fullest extent permitted by law, our total
          liability for any order is limited to the amount you paid for that order. We are not liable for indirect or
          consequential losses.
        </p>
      </Section>

      <Section n={11} title="Changes to these terms">
        <p>
          We may update these Terms from time to time. The latest version will always be available on this page, with
          the "last updated" date shown above. Continuing to use the site means you accept the updated terms.
        </p>
      </Section>

      <Section n={12} title="Governing law">
        <p>
          These Terms are governed by the laws of India, and any disputes will be subject to the jurisdiction of the
          courts where our business is registered.
        </p>
      </Section>

      <Section n={13} title="Contact us">
        <ul>
          {settings.email && <li>Email: <a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
          {settings.phone && <li>Phone: {settings.phone}</li>}
          {settings.address && <li>Address: {settings.address}</li>}
        </ul>
      </Section>
    </LegalPage>
  );
}
