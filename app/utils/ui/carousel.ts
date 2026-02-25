export function getCoverflowStyle(index: number, activeIndex: number) {
  const offset = index - activeIndex;
  const abs = Math.abs(offset);

  // Tune these to taste
  const maxVisible = 3; // how many cards to stylize on each side
  const clamped = Math.min(abs, maxVisible);

  // Hide cards far away to reduce visual noise
  if (abs > maxVisible) {
    return {
      transform: 'translateZ(-200px) scale(0.9)',
      opacity: 0,
      zIndex: 0,
      position: 'relative' as const,
      filter: 'blur(1px)',
      pointerEvents: 'none' as const,
    };
  }

  // Center card
  if (offset === 0) {
    return {
      transform: 'translateZ(120px) rotateY(0deg) scale(1)',
      opacity: 1,
      zIndex: 2000,
      position: 'relative' as const,
      filter: 'none',
    };
  }

  // Side cards (left/right)
  const dir = offset < 0 ? -1 : 1;

  // Strongest angle for the closest card (~45deg), taper off
  const rotate = 45 - clamped * 8; // 37, 29, 21...

  // Horizontal spread (must be large enough so the next card can slide in front)
  // Use px here because we're applying it as an inline transform.
  const translateX = dir * (70 + (clamped - 1) * 60);

  // Depth: closer cards stay slightly forward, farther cards go back
  const translateZ = 70 - clamped * 35; // 35, 0, -35

  // Scale down with distance
  const scale = 0.94 - clamped * 0.05;

  // Fade with distance
  const opacity = 0.92 - clamped * 0.18;

  return {
    // Note: rotate toward the center
    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${
      dir * -rotate
    }deg) scale(${scale})`,
    opacity: Math.max(0.15, opacity),
    // Ensure the closest cards stay on top of farther ones
    zIndex: 2000 - abs * 50,
    position: 'relative' as const,
    filter: abs <= 1 ? 'blur(0px)' : 'blur(0.7px)',
  };
}
