"use client";

import { Children, useRef, useState } from "react";

// Phone-only swipeable fan of cards. The active card sits straight in the middle;
// the other two tilt out on each side, cut off by the screen edge. It loops.

const SWIPE_DISTANCE = 40;

export function StepCarousel({ children }: { children: React.ReactNode }) {
  const cards = Children.toArray(children);
  const [active, setActive] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const move = (step: number) => setActive((a) => (a + step + cards.length) % cards.length);

  // Pointer events cover both fingers and a mouse drag
  function handlePointerUp(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    const distance = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(distance) >= SWIPE_DISTANCE) move(distance < 0 ? 1 : -1);
  }

  return (
    <div className="mt-2xl sm:hidden">
      <div
        className="grid cursor-grab touch-pan-y select-none justify-center pb-xl active:cursor-grabbing"
        onPointerDown={(e) => (dragStartX.current = e.clientX)}
        onPointerUp={handlePointerUp}
        onDragStart={(e) => e.preventDefault()}
      >
        {cards.map((card, i) => {
          // -1 = left, 0 = middle, 1 = right
          const offset = ((i - active + cards.length + 1) % cards.length) - 1;
          const y = offset < 0 ? -8 : offset > 0 ? 40 : 0;
          return (
            <div
              key={i}
              onClick={() => offset !== 0 && setActive(i)}
              className="col-start-1 row-start-1 transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{
                transform: `translateX(${offset * 92}%) translateY(${y}px) rotate(${offset * 8}deg)`,
                zIndex: offset === 0 ? 10 : 0,
              }}
            >
              {card}
            </div>
          );
        })}
      </div>

      <div className="mt-md flex justify-center gap-sm">
        {cards.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show step ${i + 1}`}
            aria-current={i === active}
            onClick={() => setActive(i)}
            className={`size-3 rounded-full border-2 border-navy transition-colors ${i === active ? "bg-navy" : "bg-transparent"}`}
          />
        ))}
      </div>
    </div>
  );
}
