import type { Metadata } from "next";
import { LegalPageLayout, Section } from "@/components/legal/legal-page-layout";
import { PUBLIC_SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Society Mitra collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "June 20, 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <Section title="Introduction">
        <p>
          Society Mitra (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the
          community management platform available at{" "}
          <a href={PUBLIC_SITE_URL} className="text-palette-orange hover:underline">
            {PUBLIC_SITE_URL}
          </a>
          . This Privacy Policy explains how we collect, use, disclose, and safeguard your
          information when you use our service.
        </p>
        <p>
          By using Society Mitra, you agree to the collection and use of information in
          accordance with this policy. If you do not agree, please do not use the service.
        </p>
      </Section>

      <Section title="Information We Collect">
        <p>We collect information that you provide directly and information generated through your use of the platform:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-palette-navy">Account information:</strong> mobile number
            used for sign-in (mobile and password authentication), and optional profile details such as
            full name and email address.
          </li>
          <li>
            <strong className="text-palette-navy">Society membership data:</strong> society you
            join, unit/block assignment, membership status, and role (resident, admin, etc.).
          </li>
          <li>
            <strong className="text-palette-navy">Content you submit:</strong> announcements,
            service reviews, profile updates, and join requests.
          </li>
          <li>
            <strong className="text-palette-navy">Push notification data:</strong> browser push
            subscription tokens if you opt in to notifications.
          </li>
          <li>
            <strong className="text-palette-navy">Technical data:</strong> device/browser type,
            IP address, and usage logs collected automatically by our hosting and database
            providers for security and performance.
          </li>
        </ul>
      </Section>

      <Section title="How We Use Your Information">
        <p>We use collected information to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Authenticate you and maintain your account</li>
          <li>Enable society features such as member directory, announcements, and emergency contacts</li>
          <li>Send web push notifications for society announcements (with your consent)</li>
          <li>Allow society administrators to manage memberships and approve join requests</li>
          <li>Improve platform security, reliability, and user experience</li>
          <li>Comply with applicable legal obligations</li>
        </ul>
      </Section>

      <Section title="Who Can See Your Information">
        <p>
          Society Mitra is a multi-tenant platform. Your profile and membership information
          are visible to other approved members of the same housing society, subject to
          society-level settings (for example, whether full phone numbers are shown).
        </p>
        <p>
          Society administrators can view and manage member data for societies they administer.
          Platform administrators can access data necessary to operate and support the service.
        </p>
        <p>
          We do not sell your personal information to third parties.
        </p>
      </Section>

      <Section title="Third-Party Services">
        <p>We use trusted third-party providers to operate Society Mitra:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-palette-navy">Supabase</strong> — authentication, database,
            and data storage (hosted in ap-south-1 / Mumbai, India)
          </li>
          <li>
            <strong className="text-palette-navy">Vercel</strong> — application hosting and
            content delivery
          </li>
        </ul>
        <p>
          These providers process data on our behalf under their own privacy policies and
          contractual safeguards.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          We retain your account and society data for as long as your account is active or as
          needed to provide the service. Society administrators may remove members from a
          society; you may request account deletion by contacting us.
        </p>
        <p>
          We may retain certain records as required by law or for legitimate business purposes
          such as fraud prevention and dispute resolution.
        </p>
      </Section>

      <Section title="Data Security">
        <p>
          We implement industry-standard safeguards including encrypted connections (HTTPS),
          row-level security policies in our database, and role-based access controls. No method
          of transmission over the internet is 100% secure; we cannot guarantee absolute
          security.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>Depending on applicable law, you may have the right to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Access and update your profile information through the app</li>
          <li>Request correction of inaccurate personal data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Withdraw consent for push notifications via your browser settings</li>
          <li>Lodge a complaint with a relevant data protection authority</li>
        </ul>
        <p>
          To exercise these rights, contact us at{" "}
          <a href="mailto:admin@societymitra.info" className="text-palette-orange hover:underline">
            admin@societymitra.info
          </a>
          .
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          Society Mitra is not intended for users under 18 years of age. We do not knowingly
          collect personal information from children. If you believe a child has provided us
          data, please contact us so we can delete it.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the revised policy
          on this page and update the &quot;Last updated&quot; date. Continued use of the service
          after changes constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          For questions about this Privacy Policy or our data practices, contact:
        </p>
        <p>
          <strong className="text-palette-navy">Society Mitra</strong>
          <br />
          Email:{" "}
          <a href="mailto:admin@societymitra.info" className="text-palette-orange hover:underline">
            admin@societymitra.info
          </a>
          <br />
          Website:{" "}
          <a href={PUBLIC_SITE_URL} className="text-palette-orange hover:underline">
            {PUBLIC_SITE_URL}
          </a>
        </p>
      </Section>
    </LegalPageLayout>
  );
}
