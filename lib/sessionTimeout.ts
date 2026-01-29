// Session timeout configuration (in milliseconds)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // Show warning at 5 minutes remaining

let timeoutId: NodeJS.Timeout | null = null;
let warningId: NodeJS.Timeout | null = null;
let eventListeners: Array<{ event: string; handler: () => void }> = [];

export const startSessionTimeout = (onSessionExpire: () => void, onWarning?: (timeRemaining: number) => void) => {
  // Clear existing timeouts
  resetSessionTimeout();

  // Set warning timeout (shows at 25 minutes)
  warningId = setTimeout(() => {
    if (onWarning) {
      onWarning(WARNING_TIME);
    }
  }, SESSION_TIMEOUT - WARNING_TIME);

  // Set session expiry timeout (30 minutes)
  timeoutId = setTimeout(() => {
    resetSessionTimeout();
    onSessionExpire();
  }, SESSION_TIMEOUT);

  // Reset on user activity
  const resetOnActivity = () => {
    startSessionTimeout(onSessionExpire, onWarning);
  };

  const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
  events.forEach((event) => {
    document.addEventListener(event, resetOnActivity, true);
    eventListeners.push({ event, handler: resetOnActivity });
  });
};

export const resetSessionTimeout = () => {
  if (timeoutId) clearTimeout(timeoutId);
  if (warningId) clearTimeout(warningId);
  timeoutId = null;
  warningId = null;

  // Remove all event listeners
  eventListeners.forEach(({ event, handler }) => {
    document.removeEventListener(event, handler, true);
  });
  eventListeners = [];
};

export const getSessionTimeoutConfig = () => ({
  timeout: SESSION_TIMEOUT,
  warningTime: WARNING_TIME,
  displayWarningAt: SESSION_TIMEOUT - WARNING_TIME,
});
