// WebXR haptic feedback utility for controller and hand vibration actuators.
export function triggerXRHaptic(event?: any, intensity = 0.4, duration = 15): void {
  try {
    const nativeEvent = event?.nativeEvent as any;
    const inputSource =
      nativeEvent?.data?.inputSource ??
      event?.inputSource ??
      event?.source;

    const gamepad = inputSource?.gamepad;
    if (gamepad?.hapticActuators && gamepad.hapticActuators[0]) {
      gamepad.hapticActuators[0].pulse(intensity, duration);
    }
  } catch {
    // Non-critical fallback for environments without haptics
  }
}
