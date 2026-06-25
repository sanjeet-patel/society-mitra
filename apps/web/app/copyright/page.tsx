import type { Metadata } from "next";
import { LegalPageLayout, Section } from "@/components/legal/legal-page-layout";
import { PUBLIC_SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Copyright",
  description: "Copyright and intellectual property notice for Society Mitra.",
};

const LAST_UPDATED = "June 20, 2026";

export default function CopyrightPage() {
  return (
    <LegalPageLayout title="Copyright Notice" lastUpdated={LAST_UPDATED}>
      <Section title="Copyright Ownership">
        <p>
          © {new Date().getFullYear()} Society Mitra. All rights reserved.
        </p>
        <p>
          Unless otherwise stated, all content on Society Mitra — including but not limited to
          text, graphics, logos, icons, images, software, and the overall design and layout of
          the platform — is the property of Society Mitra or its content suppliers and is
          protected by applicable copyright and intellectual property laws.
        </p>
      </Section>

      <Section title="Permitted Use">
        <p>You may use Society Mitra for its intended purpose as a resident or administrator of a registered housing society. You may not, without prior written permission:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Copy, reproduce, or redistribute any part of the platform or its source code</li>
          <li>Modify, reverse engineer, or create derivative works from our software</li>
          <li>Remove or alter any copyright, trademark, or proprietary notices</li>
          <li>Use Society Mitra branding, name, or logos for commercial purposes</li>
          <li>Scrape, mine, or systematically extract data from the platform</li>
        </ul>
      </Section>

      <Section title="User-Generated Content">
        <p>
          Content you submit to Society Mitra — such as profile information, announcements,
          reviews, or inquiries — remains yours. By submitting content, you grant Society Mitra
          a non-exclusive, worldwide, royalty-free license to host, display, and distribute that
          content solely for the purpose of operating the service within your society.
        </p>
        <p>
          You represent that you have the right to submit any content you post and that it does
          not infringe the rights of any third party.
        </p>
      </Section>

      <Section title="Third-Party Components">
        <p>
          Society Mitra incorporates open-source and third-party software components, each
          subject to its own license terms. Notable components include:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-palette-navy">Tubes Cursor background</strong> — based on
            work by Kevin Levron, licensed under{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-palette-orange hover:underline"
            >
              CC BY-NC-SA 4.0
            </a>
          </li>
          <li>Next.js, React, Supabase, and other open-source libraries under their respective licenses</li>
        </ul>
      </Section>

      <Section title="Trademarks">
        <p>
          &quot;Society Mitra&quot; and the Society Mitra logo are trademarks of Society Mitra.
          Other names and logos appearing on the platform may be trademarks of their respective
          owners. Use of third-party trademarks does not imply endorsement.
        </p>
      </Section>

      <Section title="DMCA / Infringement Claims">
        <p>
          If you believe content on Society Mitra infringes your copyright, please send a
          written notice to{" "}
          <a href="mailto:admin@societymitra.info" className="text-palette-orange hover:underline">
            admin@societymitra.info
          </a>{" "}
          including:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Identification of the copyrighted work claimed to be infringed</li>
          <li>Identification of the infringing material and its location on the platform</li>
          <li>Your contact information</li>
          <li>A statement of good-faith belief that use is not authorized</li>
          <li>A statement, under penalty of perjury, that the information is accurate and you are authorized to act</li>
        </ul>
      </Section>

      <Section title="Contact">
        <p>
          For copyright or licensing inquiries:
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
