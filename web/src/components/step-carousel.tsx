"use client";

import { Children, useRef, useState } from "react";
import { BlobWords, type BlobWord } from "@/components/blob-words";

// Phone-only swipeable fan of cards. The active card sits straight in the middle;
// its neighbours tilt out on each side, cut off by the screen edge. It doesn't loop,
// so step 1 starts with nothing on its left and only step 2 peeking on the right
// (a loop would put step 3 on the left and read as 3, 1, 2).

const SWIPE_DISTANCE = 40;
// A quick flick counts as a swipe even when it's short (pixels per millisecond)
const SWIPE_VELOCITY = 0.11;
// Below this it's a tap, however fast
const MIN_FLICK_DISTANCE = 10;

// labels: one marker-blob word per card (Pick, Drop, Render). They are the step picker under the cards.
export function StepCarousel({ children, labels }: { children: React.ReactNode; labels: BlobWord[] }) {
  const cards = Children.toArray(children);
  const [active, setActive] = useState(0);
  const dragStart = useRef<{ x: number; time: number } | null>(null);

  const move = (step: number) => setActive((a) => Math.min(cards.length - 1, Math.max(0, a + step)));

  // Pointer events cover both fingers and a mouse drag
  function handlePointerUp(e: React.PointerEvent) {
    if (dragStart.current === null) return;
    const distance = e.clientX - dragStart.current.x;
    const elapsed = Math.max(1, e.timeStamp - dragStart.current.time);
    dragStart.current = null;
    const flick = Math.abs(distance) >= MIN_FLICK_DISTANCE && Math.abs(distance) / elapsed > SWIPE_VELOCITY;
    if (Math.abs(distance) >= SWIPE_DISTANCE || flick) move(distance < 0 ? 1 : -1);
  }

  return (
    <div className="mt-2xl sm:hidden">
      <div
        className="grid cursor-grab touch-pan-y select-none justify-center pb-xl active:cursor-grabbing"
        onPointerDown={(e) => (dragStart.current = { x: e.clientX, time: e.timeStamp })}
        onPointerUp={handlePointerUp}
        onDragStart={(e) => e.preventDefault()}
      >
        {cards.map((card, i) => {
          // -1 = left, 0 = middle, 1 = right. Further away waits off to the side, hidden.
          const offset = i - active;
          const near = Math.abs(offset) <= 1;
          const y = offset < 0 ? -8 : offset > 0 ? 40 : 0;
          return (
            <div
              key={i}
              aria-hidden={!near || undefined}
              onClick={() => offset !== 0 && setActive(i)}
              className="col-start-1 row-start-1 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translateX(${offset * 92}%) translateY(${y}px) rotate(${offset * 8}deg)`,
                zIndex: offset === 0 ? 10 : 0,
                opacity: near ? 1 : 0,
                pointerEvents: near ? undefined : "none",
              }}
            >
              {card}
            </div>
          );
        })}
      </div>

      {/* Step picker: the step names on marker blobs, like the headline highlights.
          The current one pops and tilts, the others fade. Each is well over the 24px tap minimum. */}
      <div className="mt-md flex justify-center gap-xs">
        {cards.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show step ${i + 1}: ${labels[i]?.word ?? ""}`}
            aria-current={i === active}
            onClick={() => setActive(i)}
            className={`rounded-pill p-1 transition-[opacity,transform] duration-200 motion-reduce:transition-none ${i === active ? "-rotate-3 scale-110 opacity-100" : "opacity-45"}`}
          >
            {labels[i] && <BlobWords className="text-base" offset={i} words={[labels[i]]} />}
          </button>
        ))}
      </div>
    </div>
  );
}
