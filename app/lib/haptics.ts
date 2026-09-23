/**
 * Haptic feedback utility for supported browsers / devices.
 * Uses navigator.vibrate sparingly for impactful interactions.
 * Falls back gracefully to a no-op if unsupported or disabled.
 */

export type HapticType =
  | 'tap'         // Micro tap (subtle toggle / selection)
  | 'selection'   // Navigation or segmented control switch
  | 'success'     // Successful approval or completed remediation
  | 'warning'     // Cautionary action
  | 'critical';   // Destructive confirmation or security alert

export function triggerHaptic(type: HapticType = 'tap'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'tap':
        // 6ms ultra-light tactile tick
        navigator.vibrate(6);
        break;
      case 'selection':
        // 8ms subtle selection feedback
        navigator.vibrate(8);
        break;
      case 'success':
        // Distinct subtle double pulse: 10ms on, 30ms pause, 10ms on
        navigator.vibrate([10, 30, 10]);
        break;
      case 'warning':
        // 14ms warning pulse
        navigator.vibrate(14);
        break;
      case 'critical':
        // Triple pulse: 16ms, 40ms, 16ms, 40ms, 16ms
        navigator.vibrate([16, 40, 16, 40, 16]);
        break;
    }
  } catch {
    // Graceful degradation: ignore environments where vibration is blocked
  }
}
