/**
 * Utility to run a flying heart animation from the clicked element to the header wishlist button.
 */
export function animateWishlistFly(element: HTMLElement) {
  if (typeof window === "undefined" || !element) return;

  // Find target header wishlist button. Try sticky one first if it's visible, fallback to main one.
  const stickyTarget = document.getElementById("header-wishlist-button-sticky");
  const mainTarget = document.getElementById("header-wishlist-button");
  
  const isStickyVisible = stickyTarget && stickyTarget.getBoundingClientRect().height > 0;
  const target = isStickyVisible ? stickyTarget : mainTarget;
  const targetRect = target?.getBoundingClientRect();

  // Starting coordinates from the clicked heart button
  const startRect = element.getBoundingClientRect();
  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;

  // Create a floating heart element
  const heart = document.createElement("div");
  heart.style.position = "fixed";
  heart.style.zIndex = "99999";
  heart.style.pointerEvents = "none";
  heart.style.left = `${startX}px`;
  heart.style.top = `${startY}px`;
  heart.style.transform = "translate(-50%, -50%) scale(1)";
  heart.style.opacity = "1";
  heart.style.transition = "all 1.4s cubic-bezier(0.16, 1, 0.3, 1)";
  
  // HTML Content of the flying heart (using Lucide Heart SVG style)
  heart.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fe696a" stroke="#fe696a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; filter: drop-shadow(0 2px 4px rgba(254,105,106,0.3));">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  `;

  document.body.appendChild(heart);

  // Target coordinates (default to top right if header icon not found)
  const destX = targetRect ? (targetRect.left + targetRect.width / 2) : (window.innerWidth - 60);
  const destY = targetRect ? (targetRect.top + targetRect.height / 2) : 30;

  // Start the animation in the next frame
  requestAnimationFrame(() => {
    heart.style.left = `${destX}px`;
    heart.style.top = `${destY}px`;
    heart.style.transform = "translate(-50%, -50%) scale(0.3) rotate(15deg)";
    heart.style.opacity = "0.2";
  });

  // Clean up and pop the target icon
  setTimeout(() => {
    if (heart.parentNode) {
      heart.parentNode.removeChild(heart);
    }

    // Add visual pop to the header button
    if (target) {
      target.classList.add("scale-125", "text-brand-red");
      target.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      
      setTimeout(() => {
        target.classList.remove("scale-125", "text-brand-red");
      }, 300);
    }
  }, 1400);
}
