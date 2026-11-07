import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = {
  title: "Credits · Wrenn",
  description: "The people and projects Wrenn is built with.",
};

// Keep this list up to date: every outside font, library, prompt source or asset Wrenn uses goes here.
export default function CreditsPage() {
  return (
    <SimplePage title="Credits" updated="November 2026">
      <p>Wrenn is free and open source, and it stands on the work of other people. Thank you.</p>

      <h2>Fonts</h2>
      <ul>
        <li>
          <b className="text-navy">Bubblegum Sans</b> by Angel Koziupa and Alejandro Paul (Sudtipos), SIL Open Font
          License 1.1.
        </li>
        <li>
          <b className="text-navy">Figtree</b> by The Figtree Project Authors, SIL Open Font License 1.1.
        </li>
      </ul>

      <h2>Built with</h2>
      <ul>
        <li>Next.js, React and Tailwind CSS (MIT License).</li>
        <li>Playwright, for testing (Apache License 2.0).</li>
      </ul>

      <h2>Inspiration</h2>
      <ul>
        <li>The Ibong Adarna, from Filipino folklore, for our mascot&apos;s colorful tail.</li>
      </ul>

      <h2>More to come</h2>
      <p>
        As Wrenn grows, every outside tool, prompt idea and asset we use will be credited here and in the README on
        GitHub.
      </p>
    </SimplePage>
  );
}
