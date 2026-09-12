import {
  geoDistanceNm,
  segmentIntersectsCircle,
  isRouteCompletelyClearOfDanger,
  generateAvoidanceCorridor
} from './telemetryEngine';

/**
 * AeroVision FMS Simulation Automated Validation Suite
 * Tests:
 * 1. Red Zone absolute exclusion (0 penetrations).
 * 2. Segment-by-segment non-intersection verification.
 * 3. Autonomous route replacement and physical steering to destination.
 */
export function runFMSAutomatedValidation(): {
  success: boolean;
  minDistanceToDangerCenterNm: number;
  dangerRadiusNm: number;
  routeIsCertifiedClear: boolean;
  reroutedSuccessfully: boolean;
  reachedDestination: boolean;
  log: string[];
} {
  const log: string[] = [];
  log.push('Starting AeroVision Red Zone Absolute Exclusion FMS Validation Test...');

  // 1. Setup Aircraft directly aiming through the center of a Red Danger Zone
  const origin: [number, number] = [13.0827, 80.2707]; // Chennai (VOMM)
  const destination: [number, number] = [1.3521, 103.8198]; // Singapore (WSSS)
  const redDangerCenter: [number, number] = [8.5, 92.0]; // Bay of Bengal Red Exclusion Zone
  const redDangerRadiusNm = 150;

  let aircraftLat = origin[0];
  let aircraftLon = origin[1];
  let activeRoute: [number, number][] = [
    origin,
    [10.0, 88.0],
    redDangerCenter, // Direct conflict through red zone
    destination
  ];

  let currentWptIdx = 1;
  let rerouted = false;
  let minDistanceToDangerCenter = 999999;
  let routeIsCertifiedClear = false;
  const simulationStepNm = 8; // 8 NM per simulation step

  log.push(`Initial plan: Directly intersects Red Exclusion Zone centered at [${redDangerCenter[0]}, ${redDangerCenter[1]}] (Radius: ${redDangerRadiusNm} NM).`);

  // 2. Step through simulation ticks
  for (let tick = 0; tick < 300; tick++) {
    const distToDanger = geoDistanceNm(aircraftLat, aircraftLon, redDangerCenter[0], redDangerCenter[1]);
    if (distToDanger < minDistanceToDangerCenter) {
      minDistanceToDangerCenter = distToDanger;
    }

    // Predictive Hazard Avoidance check
    if (!rerouted) {
      const projectedConflict = segmentIntersectsCircle(
        [aircraftLat, aircraftLon],
        activeRoute[currentWptIdx],
        redDangerCenter,
        redDangerRadiusNm + 30
      );

      if (projectedConflict || distToDanger < redDangerRadiusNm + 180) {
        log.push(`[Tick ${tick}] RED EXCLUSION CONFLICT DETECTED at distance ${distToDanger.toFixed(1)} NM. Generating certified bypass corridor...`);

        // Generate avoidance corridor
        const avoidanceWaypoints = generateAvoidanceCorridor(
          [aircraftLat, aircraftLon],
          redDangerCenter,
          redDangerRadiusNm,
          destination
        );

        // Verify that EVERY segment of the newly generated route is 100% clear of the red danger zone
        routeIsCertifiedClear = isRouteCompletelyClearOfDanger(avoidanceWaypoints, redDangerCenter, redDangerRadiusNm);
        log.push(`[Tick ${tick}] Avoidance route certified clear of Red Zone: ${routeIsCertifiedClear ? 'YES (100% CLEAR)' : 'NO'}`);

        activeRoute = avoidanceWaypoints;
        currentWptIdx = 1;
        rerouted = true;
        log.push(`[Tick ${tick}] ACTIVE FLIGHT PLAN REPLACED with ${avoidanceWaypoints.length} verified avoidance waypoints.`);
      }
    }

    // Waypoint Navigation Step
    const targetWpt = activeRoute[currentWptIdx];
    const dLat = targetWpt[0] - aircraftLat;
    const dLon = targetWpt[1] - aircraftLon;
    const distToWpt = geoDistanceNm(aircraftLat, aircraftLon, targetWpt[0], targetWpt[1]);

    if (distToWpt <= simulationStepNm) {
      aircraftLat = targetWpt[0];
      aircraftLon = targetWpt[1];
      log.push(`[Tick ${tick}] Reached waypoint ${currentWptIdx} [${targetWpt[0].toFixed(2)}, ${targetWpt[1].toFixed(2)}].`);
      if (currentWptIdx < activeRoute.length - 1) {
        currentWptIdx++;
      } else {
        log.push(`[Tick ${tick}] DESTINATION REACHED SUCCESSFULLY.`);
        break;
      }
    } else {
      const stepRatio = simulationStepNm / distToWpt;
      aircraftLat += dLat * stepRatio;
      aircraftLon += dLon * stepRatio;
    }
  }

  const reachedDestination = geoDistanceNm(aircraftLat, aircraftLon, destination[0], destination[1]) < 25;
  const neverEnteredDanger = minDistanceToDangerCenter > redDangerRadiusNm;

  const success = rerouted && routeIsCertifiedClear && neverEnteredDanger && reachedDestination;

  log.push('----------------------------------------');
  log.push(`FINAL TEST RESULT: ${success ? 'PASSED (100% SUCCESS)' : 'FAILED'}`);
  log.push(`- Rerouted Before Red Zone: ${rerouted ? 'YES' : 'NO'}`);
  log.push(`- Route 100% Outside Red Zone: ${routeIsCertifiedClear ? 'YES (VALIDATED)' : 'NO'}`);
  log.push(`- Min Distance to Red Center: ${minDistanceToDangerCenter.toFixed(1)} NM (Buffer: +${(minDistanceToDangerCenter - redDangerRadiusNm).toFixed(1)} NM Safe Clearance)`);
  log.push(`- Red Zone Penetration: ${neverEnteredDanger ? 'NEVER (0 NM Penetration)' : 'YES (BREACHED)'}`);
  log.push(`- Reached Destination: ${reachedDestination ? 'YES' : 'NO'}`);
  log.push('----------------------------------------');

  return {
    success,
    minDistanceToDangerCenterNm: minDistanceToDangerCenter,
    dangerRadiusNm: redDangerRadiusNm,
    routeIsCertifiedClear,
    reroutedSuccessfully: rerouted,
    reachedDestination,
    log
  };
}

// Self-run when executed in Node/TS environment
if (typeof window === 'undefined') {
  const result = runFMSAutomatedValidation();
  console.log(result.log.join('\n'));
}
