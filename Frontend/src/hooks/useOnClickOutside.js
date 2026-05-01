import { useEffect } from 'react';

export function useOnClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function onMouseDown(event) {
      if (!ref?.current) return;
      if (ref.current.contains(event.target)) return;
      handler(event);
    }

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [ref, handler, enabled]);
}
