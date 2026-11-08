import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = {
  title: "Credits · Wrenn",
  description: "The songs, sounds, fonts and tools Wrenn is built with, and the people who made them.",
};

// Songs that ship inside the app. Source of truth: desktop/resources/CREDITS.md. Keep both in sync.
const songs = [
  { title: "Funky Pop", by: "HoliznaCC0", url: "https://freemusicarchive.org/music/holiznacc0/power-pop/funky-pop/" },
  { title: "Earth", by: "HoliznaCC0", url: "https://freemusicarchive.org/music/holiznacc0/interstellar-pop-songs/earth/" },
  { title: "Pop City", by: "Komiku", url: "https://freemusicarchive.org/music/Komiku/Helice_Awesome_Dance_Adventure_/pop-city/" },
  {
    title: "Can't Stop My Feet !",
    by: "Loyalty Freak Music",
    url: "https://freemusicarchive.org/music/Loyalty_Freak_Music/ROLLER_DISCO_DANCE_DANCE/Loyalty_Freak_Music_-_ROLLER_DISCO_DANCE_DANCE_-_04_Cant_Stop_My_Feet_/",
  },
  { title: "Path", by: "Metre", url: "https://freemusicarchive.org/music/Metre/conduit/path-1/" },
  { title: "Drama", by: "HoliznaCC0", url: "https://freemusicarchive.org/music/holiznacc0/power-pop/drama/" },
  { title: "Sunlit Groove", by: "Ondrosik", url: "https://freemusicarchive.org/music/Ondrosik/burnout/sunlit-groove/" },
  {
    title: "Static Shoes",
    by: "Loyalty Freak Music",
    url: "https://freemusicarchive.org/music/Loyalty_Freak_Music/MINIMAL_AMBIENT_BOUNCE/Loyalty_Freak_Music_-_MINIMAL_AMBIENT_BOUNCE_-_04_Static_Shoes/",
  },
  { title: "Saturn", by: "HoliznaCC0", url: "https://freemusicarchive.org/music/holiznacc0/interstellar-pop-songs/saturn-1/" },
  { title: "ITS A TRAP", by: "HoliznaCC0", url: "https://freemusicarchive.org/music/holiznacc0/after-dark/its-a-trap-1/" },
  { title: "Road 3 Fight", by: "Komiku", url: "https://freemusicarchive.org/music/Komiku/Helice_Awesome_Dance_Adventure_/road-3-fight/" },
  { title: "Hood Rat", by: "John Bartmann", url: "https://freemusicarchive.org/music/John_Bartmann/moody-beats/hood-rat/" },
  {
    title: "Tranquil Mindscape",
    by: "HoliznaCC0",
    url: "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/tranquil-mindscape-lofi-happy-reflection/",
  },
  {
    title: "Everyone",
    by: "Loyalty Freak Music",
    url: "https://freemusicarchive.org/music/Loyalty_Freak_Music/TO_CHILL_AND_STAY_AWAKE/Loyalty_Freak_Music_-_TO_CHILL_AND_STAY_AWAKE_-_02_Everyone/",
  },
  {
    title: "Start to play",
    by: "Anonymous420",
    url: "https://freemusicarchive.org/music/Anonymous420/Nostalgia/Anonymous420_-_Nostalgia_-_07_Start_to_play/",
  },
  { title: "City lights at night", by: "Ondrosik", url: "https://freemusicarchive.org/music/Ondrosik/burnout/city-lights-at-night/" },
];

const CC0 = "https://creativecommons.org/publicdomain/zero/1.0/";

// Keep this list up to date: every outside font, library, prompt source or asset Wrenn uses goes here.
export default function CreditsPage() {
  return (
    <SimplePage title="Credits" updated="November 2026">
      <p>Wrenn is free and open source, and it stands on the work of other people. Thank you.</p>

      <h2>Music</h2>
      <p>
        The songs inside Wrenn come from the <a href="https://freemusicarchive.org/">Free Music Archive</a>. They are
        all released under <a href={CC0}>CC0</a>, so anyone can use them for free. CC0 doesn&apos;t ask for credit,
        but these artists deserve it. We trimmed each song to two minutes, added a short fade out and evened out the
        volume.
      </p>
      <ul>
        {songs.map((song) => (
          <li key={song.url}>
            <a href={song.url}>{song.title}</a> by <b className="text-navy">{song.by}</b>
          </li>
        ))}
      </ul>

      <h2>Sound effects</h2>
      <ul>
        <li>
          Pops, clicks and one impact from <a href="https://kenney.nl/assets/interface-sounds">Interface Sounds</a> and{" "}
          <a href="https://kenney.nl/assets/sci-fi-sounds">Sci-Fi Sounds</a> by <b className="text-navy">Kenney</b>,{" "}
          <a href={CC0}>CC0</a>.
        </li>
        <li>
          The whooshes, risers, one pop and one deep hit were made for Wrenn with a small script. We release them under{" "}
          <a href={CC0}>CC0</a> too, so you can use them for anything.
        </li>
      </ul>

      <h2>Fonts</h2>
      <ul>
        <li>
          <b className="text-navy">Bubblegum Sans</b> by Angel Koziupa and Alejandro Paul (Sudtipos), SIL Open Font
          License 1.1.
        </li>
        <li>
          <b className="text-navy">Figtree</b> by The Figtree Project Authors, SIL Open Font License 1.1. Used on this
          website and in the app.
        </li>
      </ul>

      <h2>Making the videos</h2>
      <ul>
        <li>
          <a href="https://ffmpeg.org/">FFmpeg</a> turns the frames and sound into an MP4. Wrenn includes it through
          the ffmpeg-static package, which uses a GPL build of FFmpeg.
        </li>
        <li>
          <a href="https://gsap.com/">GSAP</a> by GreenSock moves things around in each scene. It&apos;s free to use
          under the <a href="https://gsap.com/standard-license">GSAP Standard License</a>.
        </li>
        <li>
          <a href="https://www.anthropic.com/claude-code">Claude Code</a> by Anthropic builds each video. Wrenn runs
          your own copy, signed in to your own account.
        </li>
      </ul>

      <h2>Built with</h2>
      <ul>
        <li>Electron, for the desktop app (MIT License).</li>
        <li>React and Tailwind CSS, in the app and on this website (MIT License).</li>
        <li>Next.js, for this website (MIT License).</li>
        <li>Playwright, for testing (Apache License 2.0).</li>
      </ul>

      <h2>Inspiration</h2>
      <ul>
        <li>
          <a href="https://motion-graphics.org/">motion-graphics.org</a>, for ideas on what makes a good showreel
          template. We took inspiration only, not their prompts or designs.
        </li>
        <li>The Ibong Adarna, from Filipino folklore, for our mascot&apos;s colorful tail.</li>
      </ul>

      <h2>Something missing?</h2>
      <p>
        If you made something Wrenn uses and we got your credit wrong or left it out, open an issue on Wrenn&apos;s
        GitHub page and we&apos;ll fix it.
      </p>
    </SimplePage>
  );
}
