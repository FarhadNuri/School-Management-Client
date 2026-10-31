import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If navigating to an anchor hash (e.g. #contact), let the browser or scrollIntoView handle it
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Otherwise, immediately scroll to the top of the window
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Also reset scroll for portal content area if present
    const portalContent = document.querySelector('.portal-app .ct');
    if (portalContent) {
      portalContent.scrollTop = 0;
    }
  }, [pathname, hash]);

  return null;
}

