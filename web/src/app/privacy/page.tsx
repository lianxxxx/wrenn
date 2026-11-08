import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = {
  title: "Privacy · Wrenn",
  description: "What Wrenn keeps on your computer, and what goes to Claude Code and ElevenLabs when you use them.",
};

// Matches desktop/src/main (jobs.ts, settings.ts, claude.ts, audio/elevenlabs.ts). Update this page when those change.
export default function PrivacyPage() {
  return (
    <SimplePage title="Privacy" updated="November 2026">
      <p>
        Short version: <b className="text-navy">Wrenn has no servers, no accounts and no tracking.</b> We never see
        your files. The only places your stuff goes are the services you sign in to yourself: Claude Code, and
        ElevenLabs if you add a key.
      </p>

      <h2>What stays on your computer</h2>
      <ul>
        <li>
          Your finished videos. They are saved as MP4 files in the Wrenn folder inside your Videos folder.
        </li>
        <li>
          Your settings, in a small file in Wrenn&apos;s app folder. If you add an ElevenLabs key, it&apos;s encrypted
          with Windows&apos; own protection before it&apos;s saved. On the rare computer where that isn&apos;t
          available, the key is saved as plain text in that same file.
        </li>
        <li>
          A working folder for each video. When you click Generate, Wrenn copies the photos, screen recordings, logo
          and song you added into a new folder in its app folder, next to the details you typed (brand name, ending
          text, size, length and vibe). Wrenn deletes these folders after 7 days. Your original files are never
          moved or changed.
        </li>
      </ul>

      <h2>Claude Code</h2>
      <p>
        Wrenn builds your video with Claude Code, the one you installed and signed in to yourself. Wrenn runs it in
        the background inside that video&apos;s working folder. Claude Code reads the files and details in there to
        make your scenes, so they are sent to Anthropic as part of your own Claude Code session. That falls under
        your Anthropic account, your Claude plan and{" "}
        <a href="https://www.anthropic.com/legal/privacy">Anthropic&apos;s privacy policy</a>.
      </p>
      <p>
        Wrenn never reads or saves your Claude login. It only asks Claude Code whether it&apos;s installed and signed
        in, so it can tell you if something needs fixing.
      </p>

      <h2>ElevenLabs (optional)</h2>
      <p>
        You can add your own ElevenLabs key in Settings. Wrenn only uses it when you pick &quot;A new song&quot; for
        your music. Then it sends ElevenLabs a short description of the style of music (based on the vibe you
        picked) and how long the song should be. No photos, videos, names or text you typed are sent. This falls
        under <a href="https://elevenlabs.io/privacy-policy">ElevenLabs&apos; privacy policy</a> and your ElevenLabs
        plan. Without a key, nothing goes to ElevenLabs.
      </p>

      <h2>Updates</h2>
      <p>
        Wrenn will soon check GitHub Releases for new versions. That&apos;s a normal request to GitHub, like opening a
        web page, so GitHub sees your IP address. It doesn&apos;t include your files or anything about your videos.
      </p>

      <h2>What Wrenn doesn&apos;t do</h2>
      <ul>
        <li>No account or sign-up.</li>
        <li>No analytics, tracking or ads in the app.</li>
        <li>No selling or sharing your data. We never have it in the first place.</li>
      </ul>

      <h2>This website</h2>
      <p>
        This website has no analytics, cookies or ads. If you switch to dark mode, your browser remembers that
        choice on your own device. The site is hosted on Vercel, which, like any web host, may keep basic request
        logs (such as IP addresses) to keep the site running.
      </p>

      <h2>Questions</h2>
      <p>If something here is unclear, open an issue on Wrenn&apos;s GitHub page.</p>
    </SimplePage>
  );
}
