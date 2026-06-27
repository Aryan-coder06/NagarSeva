import { useState, useEffect } from 'react';

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const AnimatedCounter = ({ value = 0, duration = 1200, className = '' }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }

    let start = null;
    let rafId;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);

      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, duration]);

  return <span className={className}>{display}</span>;
};

export default AnimatedCounter;
