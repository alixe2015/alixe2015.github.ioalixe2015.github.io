/**
 * Web Vibration API helper for somatic tactile feedback.
 * Provides safe vibration patterns that simulate heartbeat, inhale surge, and paper touches.
 */

export const somaticHaptics = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  },

  // Soft single tap (like pressing a shutter or touching textured paper)
  paperTap() {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate(12);
    } catch {}
  },

  // Gentle double pulse (heartbeat resonance)
  heartbeat() {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate([18, 60, 24]);
    } catch {}
  },

  // Inhale surge - gentle swelling sensation
  inhaleStart() {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate([15, 80, 20]);
    } catch {}
  },

  // Hold breath - steady grounding mark
  holdAnchor() {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate(28);
    } catch {}
  },

  // Exhale release - gradual gentle release
  exhaleStart() {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate([22, 100, 15, 120, 10]);
    } catch {}
  },

  // Stop any active vibration
  cancel() {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate(0);
    } catch {}
  }
};
