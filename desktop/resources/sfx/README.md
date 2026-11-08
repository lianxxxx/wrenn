# Sound effects

All files: WAV, 44.1 kHz, 16-bit, stereo. Silence at the start and end is trimmed. The same data is in `sfx.json`.

**Hit point** = seconds from the start of the file where the sound is loudest. To make a sound land at video time `t`, start the file at `t - hit`.

- Pops and clicks hit right away (0.0).
- Whooshes swell, peak in the middle, then fall away.
- Risers get louder all the way and end on their peak, so `hit` = `length`. Start a riser at `t - length` and it ends exactly on the hit.

| File | Type | Length (s) | Hit (s) | Source |
| - | - | - | - | - |
| pop-1.wav | pop | 0.188 | 0.0 | Kenney, Interface Sounds (drop_002) |
| pop-2.wav | pop | 0.126 | 0.0 | Kenney, Interface Sounds (pluck_002) |
| pop-3.wav | pop | 0.120 | 0.0 | Made for Wrenn |
| whoosh-1.wav | whoosh | 0.579 | 0.30 | Made for Wrenn |
| whoosh-2.wav | whoosh | 0.876 | 0.48 | Made for Wrenn |
| click-1.wav | click | 0.097 | 0.0 | Kenney, Interface Sounds (click_001) |
| click-2.wav | click | 0.099 | 0.0 | Kenney, Interface Sounds (toggle_001) |
| impact-1.wav | impact | 1.000 | 0.10 | Kenney, Sci-Fi Sounds (lowFrequency_explosion_001) |
| impact-2.wav | impact | 1.200 | 0.02 | Made for Wrenn |
| riser-1.wav | riser | 2.000 | 2.0 (end) | Made for Wrenn |
| riser-2.wav | riser | 1.000 | 1.0 (end) | Made for Wrenn |

Hit points were measured as the loudest 10 ms window, so they are accurate to about 10 ms.

"Made for Wrenn" files were generated with a small script (filtered noise and sine sweeps), not recorded. They are released as CC0 with the rest of this folder. Details in `../CREDITS.md`.
