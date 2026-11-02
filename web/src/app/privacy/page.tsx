import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = {
  title: "Privacy · Wrenn",
  description: "Your photos, videos and finished videos stay on your computer.",
};

// Draft: review before launch, especially once Phase 3 confirms how Wrenn runs Claude Code.
export default function PrivacyPage() {
  return (
    <SimplePage title="Privacy" updated="November 2026">
      <p>
        Short version: <b className="text-navy">your files stay on your computer.</b> Wrenn has no servers, no
        accounts and no tracking.
      </p>

      <h2>What stays on your computer</h2>
      <ul>
        <li>The photos, videos, logos and text you add to Wrenn.</li>
        <li>The videos Wrenn makes. They are saved as MP4 files in a folder you choose.</li>
        <li>Your settings, and your ElevenLabs key if you add one.</li>
      </ul>
      <p>Wrenn never uploads any of this to us. We don&apos;t have a server to upload it to.</p>

      <h2>What Wrenn doesn&apos;t do</h2>
      <ul>
        <li>No account or sign-up.</li>
        <li>No analytics, tracking or ads, in the app or on this website.</li>
        <li>No selling or sharing your data. We never have it in the first place.</li>
      </ul>

      <h2>Services you connect yourself</h2>
      <p>
        <b className="text-navy">Claude Code.</b> Wrenn builds your video using Claude Code, signed in to your own
        Claude account. What Wrenn sends to Claude to make the video (like your text and the details you type) goes
        through Anthropic, under Anthropic&apos;s privacy policy and your Claude plan.
      </p>
      <p>
        <b className="text-navy">ElevenLabs (optional).</b> If you add your own ElevenLabs key for voiceovers, the
        voiceover text is sent to ElevenLabs, under their privacy policy. Without a key, nothing goes to ElevenLabs.
      </p>

      <h2>Updates</h2>
      <p>To check for new versions, Wrenn may ask GitHub whether a newer release exists. That check doesn&apos;t include your files.</p>

      <h2>Questions</h2>
      <p>If something here is unclear, open an issue on Wrenn&apos;s GitHub page.</p>
    </SimplePage>
  );
}
