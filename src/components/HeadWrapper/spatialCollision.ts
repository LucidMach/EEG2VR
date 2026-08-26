import * as THREE from "three";

// Physical bounding geometry parameters (in meters)
export const HEAD_BOUNDS = {
  radius: 0.18, // 18cm safety radius comfortably enclosing the scaled head mesh + electrodes
};

export const PANEL_BOUNDS = {
  halfWidth: 0.40,  // 40cm half-width (0.80m total width)
  halfHeight: 0.17, // 17cm half-height (0.34m total height)
  halfDepth: 0.06,  // 6cm half-thickness (0.12m total thickness with safety padding)
};

// Reusable temporary vector/quaternion pool to prevent GC overhead during drag loops
const _vWorld = new THREE.Vector3();
const _vLocal = new THREE.Vector3();
const _cLocal = new THREE.Vector3();
const _dLocal = new THREE.Vector3();
const _pushLocal = new THREE.Vector3();
const _pushWorld = new THREE.Vector3();
const _invPanelQuat = new THREE.Quaternion();

/**
 * Resolves candidate control panel position so that the panel box does not
 * penetrate the EEG head sphere centered at `headPos`.
 * Modifies `candidatePanelPos` in-place.
 */
export function resolvePanelPosition(
  candidatePanelPos: THREE.Vector3,
  panelQuat: THREE.Quaternion,
  headPos: THREE.Vector3
): void {
  // Vector from candidate panel center to head center in world space
  _vWorld.subVectors(headPos, candidatePanelPos);

  // Transform head center into panel's local coordinate frame
  _invPanelQuat.copy(panelQuat).invert();
  _vLocal.copy(_vWorld).applyQuaternion(_invPanelQuat);

  const hx = PANEL_BOUNDS.halfWidth;
  const hy = PANEL_BOUNDS.halfHeight;
  const hz = PANEL_BOUNDS.halfDepth;

  // Closest point on the panel box to head center (clamped in local space)
  _cLocal.set(
    THREE.MathUtils.clamp(_vLocal.x, -hx, hx),
    THREE.MathUtils.clamp(_vLocal.y, -hy, hy),
    THREE.MathUtils.clamp(_vLocal.z, -hz, hz)
  );

  // Vector from closest point on panel to head center
  _dLocal.subVectors(_vLocal, _cLocal);
  const distSq = _dLocal.lengthSq();
  const radius = HEAD_BOUNDS.radius;

  if (distSq < radius * radius) {
    const dist = Math.sqrt(distSq);
    const penetration = radius - dist;

    if (dist > 0.0001) {
      // Normal pointing from panel toward head
      _dLocal.multiplyScalar(1 / dist);
      // Push panel in opposite direction of head: -_dLocal * penetration
      _pushLocal.copy(_dLocal).multiplyScalar(-penetration);
    } else {
      // Deep penetration: push along shortest face axis
      const dx1 = _vLocal.x - (-hx);
      const dx2 = hx - _vLocal.x;
      const dy1 = _vLocal.y - (-hy);
      const dy2 = hy - _vLocal.y;
      const dz1 = _vLocal.z - (-hz);
      const dz2 = hz - _vLocal.z;

      const minDelta = Math.min(dx1, dx2, dy1, dy2, dz1, dz2);
      if (minDelta === dy1) {
        _pushLocal.set(0, -(dy1 + radius), 0);
      } else if (minDelta === dy2) {
        _pushLocal.set(0, dy2 + radius, 0);
      } else if (minDelta === dz1) {
        _pushLocal.set(0, 0, -(dz1 + radius));
      } else if (minDelta === dz2) {
        _pushLocal.set(0, 0, dz2 + radius);
      } else if (minDelta === dx1) {
        _pushLocal.set(-(dx1 + radius), 0, 0);
      } else {
        _pushLocal.set(dx2 + radius, 0, 0);
      }
    }

    // Convert push vector from panel local space to world space and apply
    _pushWorld.copy(_pushLocal).applyQuaternion(panelQuat);
    candidatePanelPos.add(_pushWorld);
  }
}

/**
 * Resolves candidate EEG head position so that the head sphere does not
 * penetrate the control panel box at `panelPos` / `panelQuat`.
 * Modifies `candidateHeadPos` in-place.
 */
export function resolveHeadPosition(
  candidateHeadPos: THREE.Vector3,
  _headQuat: THREE.Quaternion,
  panelPos: THREE.Vector3,
  panelQuat: THREE.Quaternion
): void {
  // Vector from panel center to candidate head center in world space
  _vWorld.subVectors(candidateHeadPos, panelPos);

  // Transform head center into panel's local coordinate frame
  _invPanelQuat.copy(panelQuat).invert();
  _vLocal.copy(_vWorld).applyQuaternion(_invPanelQuat);

  const hx = PANEL_BOUNDS.halfWidth;
  const hy = PANEL_BOUNDS.halfHeight;
  const hz = PANEL_BOUNDS.halfDepth;

  // Closest point on the panel box to head center (clamped in local space)
  _cLocal.set(
    THREE.MathUtils.clamp(_vLocal.x, -hx, hx),
    THREE.MathUtils.clamp(_vLocal.y, -hy, hy),
    THREE.MathUtils.clamp(_vLocal.z, -hz, hz)
  );

  // Vector from closest point on panel to head center
  _dLocal.subVectors(_vLocal, _cLocal);
  const distSq = _dLocal.lengthSq();
  const radius = HEAD_BOUNDS.radius;

  if (distSq < radius * radius) {
    const dist = Math.sqrt(distSq);
    const penetration = radius - dist;

    if (dist > 0.0001) {
      // Normal pointing from panel toward head
      _dLocal.multiplyScalar(1 / dist);
      // Push head away from panel in direction of normal: +_dLocal * penetration
      _pushLocal.copy(_dLocal).multiplyScalar(penetration);
    } else {
      // Deep penetration: push along shortest face axis
      const dx1 = _vLocal.x - (-hx);
      const dx2 = hx - _vLocal.x;
      const dy1 = _vLocal.y - (-hy);
      const dy2 = hy - _vLocal.y;
      const dz1 = _vLocal.z - (-hz);
      const dz2 = hz - _vLocal.z;

      const minDelta = Math.min(dx1, dx2, dy1, dy2, dz1, dz2);
      if (minDelta === dy1) {
        _pushLocal.set(0, -(dy1 + radius), 0);
      } else if (minDelta === dy2) {
        _pushLocal.set(0, dy2 + radius, 0);
      } else if (minDelta === dz1) {
        _pushLocal.set(0, 0, -(dz1 + radius));
      } else if (minDelta === dz2) {
        _pushLocal.set(0, 0, dz2 + radius);
      } else if (minDelta === dx1) {
        _pushLocal.set(-(dx1 + radius), 0, 0);
      } else {
        _pushLocal.set(dx2 + radius, 0, 0);
      }
    }

    // Convert push vector from panel local space to world space and apply
    _pushWorld.copy(_pushLocal).applyQuaternion(panelQuat);
    candidateHeadPos.add(_pushWorld);
  }
}
