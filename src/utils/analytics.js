export const trackEvent = async (eventName, payload = {}) => {
  try {
    await fetch('/api/admin/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        payload,
        ts: Date.now(),
      })
    });
  } catch (e) {
    // Best-effort; ignore failures
  }
};

export const trackPageView = (page, user) => {
  return trackEvent('page_view', {
    page,
    user: user?.email || null
  });
};

export const trackLogin = (user) => {
  return trackEvent('login', {
    user: user?.email || null
  });
};

export const trackLogout = (user) => {
  return trackEvent('logout', {
    user: user?.email || null
  });
};


