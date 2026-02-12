'use client';

import { useEffect, useState } from 'react';

interface ScrollToBottomProps {
  containerRef: React.RefObject<HTMLElement>;
  threshold?: number;
}

export function ScrollToBottom({ containerRef, threshold = 100 }: ScrollToBottomProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsVisible(distanceFromBottom > threshold);
    };

    container.addEventListener('scroll', checkScroll);
    checkScroll(); // Initial check

    return () => container.removeEventListener('scroll', checkScroll);
  }, [containerRef, threshold]);

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToBottom}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Scroll to bottom"
      className="z-[1] size-9 inline-flex items-center justify-center absolute -top-8 left-1/2 -translate-x-1/2 border-0.5 overflow-hidden !rounded-full p-1 shadow-md hover:shadow-lg bg-white/80 hover:bg-white backdrop-blur transition-all duration-200 border-stone-300 opacity-100 pointer-events-auto"
    >
      {/* Animated Claude logo on hover */}
      <div aria-hidden="true">
        <div 
          className={`absolute blur-md transition duration-300 pointer-events-none w-8 text-amber-500 inline-block select-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            className="w-full fill-current"
          >
            <path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z"></path>
          </svg>
        </div>
      </div>

      {/* Down arrow icon */}
      <div 
        className="mix-blend-luminosity" 
        style={{ 
          width: '20px', 
          height: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          xmlns="http://www.w3.org/2000/svg" 
          className="mix-blend-luminosity" 
          aria-hidden="true" 
          style={{ flexShrink: 0 }}
        >
          <path d="M10 3C10.2761 3.00006 10.5 3.2239 10.5 3.5V15.293L14.6465 11.1465C14.8418 10.9514 15.1583 10.9513 15.3536 11.1465C15.5487 11.3417 15.5486 11.6583 15.3536 11.8535L10.3535 16.8535C10.2598 16.9473 10.1326 17 10 17C9.90062 17 9.8042 16.9703 9.72268 16.916L9.64651 16.8535L4.6465 11.8535C4.45138 11.6582 4.45128 11.3417 4.6465 11.1465C4.84172 10.9513 5.15827 10.9514 5.35353 11.1465L9.50003 15.293V3.5C9.50003 3.22386 9.72389 3 10 3Z"></path>
        </svg>
      </div>
    </button>
  );
}