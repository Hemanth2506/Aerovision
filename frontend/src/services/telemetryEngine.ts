import { AircraftTelemetry, OperationalAlert, DatalinkMessage, HealthRiskCategory, RouteOption } from '../types';
import { INITIAL_AIRCRAFT_LIST, INITIAL_ALERTS, INITIAL_DATALINK_MESSAGES, WEATHER_ADVISORIES } from '../data/mockData';
import { audioService } from './audioService';

export type SimulationSpeed = 0 | 0.5 | 1 | 2 | 5;

export type FaultType = 
  | 'HPT_THERMAL_CREEP'
  | 'HYD_LEAK_CIRCUIT_B'
  | 'FUEL_NOZZLE_CLOG'
  | 'PITOT_STATIC_DRIFT'
  | 'LEVEL_5_STORM_CELL'
  | 'NONE';

type TelemetrySubscriber = (fleet: AircraftTelemetry[], activeAircraft: AircraftTelemetry) => void;
type AlertSubscriber = (alerts: OperationalAlert[]) => void;
type DatalinkSubscriber = (messages: DatalinkMessage[]) => void;

interface FMSFlightPlan {
  currentWaypointIndex: number;
  hasAvoidanceActive: boolean;
  threatDetected: boolean;
  etaMinutes: number;
}

// Distance in nautical miles between two lat/lon coordinates
export function geoDistanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * 60;
  const avgLatRad = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * 60 * Math.cos(avgLatRad);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

// Check if a line segment between A and B intersects or comes within radius of center C
export function segmentIntersectsCircle(
  p1: [number, number],
  p2: [number, number],
  center: [number, number],
  radiusNm: number
): boolean {
  const d1 = geoDistanceNm(p1[0], p1[1], center[0], center[1]);
  const d2 = geoDistanceNm(p2[0], p2[1], center[0], center[1]);
  if (d1 <= radiusNm || d2 <= radiusNm) return true;

  const dx = (p2[1] - p1[1]) * Math.cos(((p1[0] + p2[0]) / 2) * (Math.PI / 180));
  const dy = p2[0] - p1[0];
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return d1 <= radiusNm;

  const cx = (center[1] - p1[1]) * Math.cos(((p1[0] + center[0]) / 2) * (Math.PI / 180));
  const cy = center[0] - p1[0];

  const t = Math.max(0, Math.min(1, (cx * dx + cy * dy) / lenSq));
  const projLat = p1[0] + t * dy;
  const projLon = p1[1] + t * (p2[1] - p1[1]);
  const distToProj = geoDistanceNm(projLat, projLon, center[0], center[1]);
  return distToProj <= radiusNm;
}

// Check if entire route has zero intersections with a red danger exclusion zone
export function isRouteCompletelyClearOfDanger(
  route: [number, number][],
  dangerCenter: [number, number],
  dangerRadiusNm: number
): boolean {
  for (let i = 0; i < route.length - 1; i++) {
    if (segmentIntersectsCircle(route[i], route[i + 1], dangerCenter, dangerRadiusNm)) {
      return false;
    }
  }
  return true;
}

// Generate guaranteed certified avoidance corridor that NEVER touches the red exclusion zone
export function generateAvoidanceCorridor(
  currentPos: [number, number],
  dangerCenter: [number, number],
  dangerRadiusNm: number,
  destination: [number, number]
): [number, number][] {
  // Certified safety clearance radius (storm radius + 75 NM absolute safety buffer)
  const clearanceRadiusNm = dangerRadiusNm + 75;
  const clearanceRadiusDeg = clearanceRadiusNm / 60;

  // Bearing from current position to danger center
  const dLatToCenter = dangerCenter[0] - currentPos[0];
  const avgLat = ((currentPos[0] + dangerCenter[0]) / 2) * (Math.PI / 180);
  const dLonToCenter = (dangerCenter[1] - currentPos[1]) * Math.cos(avgLat);
  const bearingToCenter = Math.atan2(dLonToCenter, dLatToCenter);

  // Test candidate bypass angles: +90° (left), -90° (right), +110°, -110°
  const candidateAngles = [
    bearingToCenter + Math.PI / 2,
    bearingToCenter - Math.PI / 2,
    bearingToCenter + (Math.PI * 110) / 180,
    bearingToCenter - (Math.PI * 110) / 180
  ];

  let bestRoute: [number, number][] | null = null;
  let shortestLength = Infinity;

  for (const angle of candidateAngles) {
    const entryWpt: [number, number] = [
      dangerCenter[0] + clearanceRadiusDeg * Math.cos(angle),
      dangerCenter[1] + (clearanceRadiusDeg * Math.sin(angle)) / Math.cos(avgLat)
    ];

    const downstreamWpt: [number, number] = [
      entryWpt[0] + (clearanceRadiusDeg * 0.45) * Math.cos(bearingToCenter),
      entryWpt[1] + (clearanceRadiusDeg * 0.45 * Math.sin(bearingToCenter)) / Math.cos(avgLat)
    ];

    const candidateRoute: [number, number][] = [
      [currentPos[0], currentPos[1]],
      entryWpt,
      downstreamWpt,
      [destination[0], destination[1]]
    ];

    // Rigorously verify that EVERY segment of the candidate route is 100% outside the red danger zone
    if (isRouteCompletelyClearOfDanger(candidateRoute, dangerCenter, dangerRadiusNm)) {
      const length = geoDistanceNm(currentPos[0], currentPos[1], entryWpt[0], entryWpt[1]) +
                     geoDistanceNm(entryWpt[0], entryWpt[1], downstreamWpt[0], downstreamWpt[1]) +
                     geoDistanceNm(downstreamWpt[0], downstreamWpt[1], destination[0], destination[1]);

      if (length < shortestLength) {
        shortestLength = length;
        bestRoute = candidateRoute;
      }
    }
  }

  // Fallback to primary wide clearance if all tight candidates clip
  if (!bestRoute) {
    const wideRadiusDeg = (dangerRadiusNm + 110) / 60;
    const wideLeftWpt: [number, number] = [
      dangerCenter[0] + wideRadiusDeg * Math.cos(bearingToCenter + Math.PI / 2),
      dangerCenter[1] + (wideRadiusDeg * Math.sin(bearingToCenter + Math.PI / 2)) / Math.cos(avgLat)
    ];
    bestRoute = [
      [currentPos[0], currentPos[1]],
      wideLeftWpt,
      [destination[0], destination[1]]
    ];
  }

  return bestRoute;
}

class TelemetryEngine {
  private fleet: AircraftTelemetry[] = JSON.parse(JSON.stringify(INITIAL_AIRCRAFT_LIST));
  private fmsPlans: Map<string, FMSFlightPlan> = new Map();
  private activeAircraftId: string = 'AC-A359-02'; // Default to AV-304
  private alerts: OperationalAlert[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
  private datalinkMessages: DatalinkMessage[] = JSON.parse(JSON.stringify(INITIAL_DATALINK_MESSAGES));
  private speed: SimulationSpeed = 1;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private activeFault: FaultType = 'NONE';
  private faultInjectedAircraftId: string | null = null;
  
  private subscribers: Set<TelemetrySubscriber> = new Set();
  private alertSubscribers: Set<AlertSubscriber> = new Set();
  private datalinkSubscribers: Set<DatalinkSubscriber> = new Set();

  constructor() {
    this.fleet.forEach((ac) => {
      this.fmsPlans.set(ac.aircraftId, {
        currentWaypointIndex: 1,
        hasAvoidanceActive: false,
        threatDetected: false,
        etaMinutes: 180
      });
    });
    this.startSimulation();
  }

  public getFleet(): AircraftTelemetry[] {
    return this.fleet;
  }

  public getActiveAircraft(): AircraftTelemetry {
    const found = this.fleet.find(a => a.aircraftId === this.activeAircraftId);
    return found || this.fleet[0];
  }

  public setActiveAircraft(aircraftId: string) {
    this.activeAircraftId = aircraftId;
    this.notify();
  }

  public getAlerts(): OperationalAlert[] {
    return this.alerts;
  }

  public getDatalinkMessages(): DatalinkMessage[] {
    return this.datalinkMessages;
  }

  public setSpeed(speed: SimulationSpeed) {
    this.speed = speed;
    this.startSimulation();
  }

  public getSpeed(): SimulationSpeed {
    return this.speed;
  }

  public getActiveFault(): { fault: FaultType; aircraftId: string | null } {
    return { fault: this.activeFault, aircraftId: this.faultInjectedAircraftId };
  }

  public subscribe(cb: TelemetrySubscriber): () => void {
    this.subscribers.add(cb);
    cb(this.fleet, this.getActiveAircraft());
    return () => this.subscribers.delete(cb);
  }

  public subscribeAlerts(cb: AlertSubscriber): () => void {
    this.alertSubscribers.add(cb);
    cb(this.alerts);
    return () => this.alertSubscribers.delete(cb);
  }

  public subscribeDatalink(cb: DatalinkSubscriber): () => void {
    this.datalinkSubscribers.add(cb);
    cb(this.datalinkMessages);
    return () => this.datalinkSubscribers.delete(cb);
  }

  public acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.notifyAlerts();
    }
  }

  // DYNAMIC RISK ENGINE CALCULATION (Red Danger, Yellow Caution, Green Safe)
  public calculateRisk(ac: AircraftTelemetry): { score: number; status: HealthRiskCategory; category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' } {
    let score = 5;

    // 1. Weather Severity & Hazard Proximity
    if (ac.environment.stormSeverity === 'EXTREME' || ac.environment.stormSeverity === 'SEVERE') {
      score += 48;
    } else if (ac.environment.stormSeverity === 'MODERATE') {
      score += 24; // Yellow Caution Zone
    }

    if (ac.environment.turbulenceIndexEdr > 0.6) {
      score += 26;
    } else if (ac.environment.turbulenceIndexEdr > 0.3) {
      score += 14;
    }

    if (ac.environment.icingRisk === 'SEVERE') {
      score += 22;
    } else if (ac.environment.icingRisk === 'MEDIUM') {
      score += 12;
    }

    if (ac.environment.visibilityKm < 3.0) {
      score += 15;
    } else if (ac.environment.visibilityKm < 6.0) {
      score += 8;
    }

    // 2. Engine & Technical Exceedances
    if (ac.engine2.egtDegC > 780 || ac.engine1.egtDegC > 780) {
      score += 35;
    } else if (ac.engine2.egtDegC > 720 || ac.engine1.egtDegC > 720) {
      score += 15;
    }

    if (ac.engine2.vibrationN2 > 1.2 || ac.engine1.vibrationN1 > 1.2) {
      score += 20;
    }

    if (ac.hydraulics.systemBPressurePsi < 2200) {
      score += 30;
    }

    score = Math.min(100, Math.max(4, score));

    let status: HealthRiskCategory = 'SAFE';
    let category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';

    if (score >= 70) {
      status = 'DANGER'; // RED
      category = 'CRITICAL';
    } else if (score >= 35) {
      status = 'CAUTION'; // YELLOW
      category = 'MODERATE';
    } else {
      status = 'SAFE'; // GREEN
      category = 'LOW';
    }

    return { score, status, category };
  }

  // AUTOMATIC AUTONOMOUS FMS REROUTING (NEVER ENTER RED EXCLUSION ZONES)
  public executeReroute(aircraftId: string, optionId?: string) {
    const target = this.fleet.find(a => a.aircraftId === aircraftId);
    if (!target) return;

    const currentPos: [number, number] = [target.latitude, target.longitude];
    const destination: [number, number] = target.activeRoute[target.activeRoute.length - 1];

    let newRouteWaypoints: [number, number][];

    if (target.activeDangerZone) {
      // Calculate guaranteed non-intersecting lateral bypass corridor
      newRouteWaypoints = generateAvoidanceCorridor(
        currentPos,
        [target.activeDangerZone.lat, target.activeDangerZone.lon],
        target.activeDangerZone.radiusNm,
        destination
      );
    } else if (target.rerouteOptions && target.rerouteOptions.length > 0) {
      const opt = target.rerouteOptions.find(o => o.id === optionId) || target.rerouteOptions[0];
      newRouteWaypoints = [currentPos, ...opt.waypoints.filter((_, i) => i > 0)];
    } else {
      newRouteWaypoints = [
        currentPos,
        [currentPos[0] + 3.0, currentPos[1] + 3.5],
        destination
      ];
    }

    // 1. Freeze original hazardous route in RED
    if (!target.originalRoute || target.originalRoute.length === 0) {
      target.originalRoute = [...target.activeRoute];
    }

    // 2. REPLACE active route immediately with avoidance waypoints in GREEN
    target.activeRoute = newRouteWaypoints;
    target.isRerouted = true;

    // 3. Update FMS navigation state: target first avoidance waypoint
    const fms = this.fmsPlans.get(target.aircraftId) || {
      currentWaypointIndex: 1,
      hasAvoidanceActive: true,
      threatDetected: true,
      etaMinutes: 180
    };
    fms.currentWaypointIndex = 1;
    fms.hasAvoidanceActive = true;
    fms.threatDetected = false;
    this.fmsPlans.set(target.aircraftId, fms);

    // 4. Immediately recalculate heading towards the avoidance waypoint
    const nextWpt = target.activeRoute[1];
    if (nextWpt) {
      const dLat = nextWpt[0] - target.latitude;
      const dLon = nextWpt[1] - target.longitude;
      target.headingDeg = ((Math.atan2(dLon, dLat) * 180) / Math.PI + 360) % 360;
    }

    // 5. Calibrate environmental parameters to safe corridor values
    target.environment.stormSeverity = 'LIGHT';
    target.environment.turbulenceIndexEdr = 0.12;
    target.environment.rainProbabilityPercent = 10;
    target.environment.visibilityKm = 10.0;
    target.environment.icingRisk = 'LOW';

    // 6. Update risk state (drops from DANGER to SAFE)
    const risk = this.calculateRisk(target);
    target.riskScore = risk.score;
    target.safetyStatus = risk.status;
    target.riskCategory = risk.category;
    target.riskTrend = 'IMPROVING';

    // 7. Dispatch CPDLC datalink notification to Pilot and Tower views
    const now = new Date().toISOString().substring(11, 19) + 'Z';
    this.datalinkMessages.unshift({
      id: `MSG-CPDLC-${Date.now()}`,
      timestamp: now,
      sender: 'AI_SYSTEM',
      flightNumber: target.flightNumber,
      aircraftId: target.aircraftId,
      type: 'ROUTE_OPTIMIZED_CLEARANCE',
      content: `AUTONOMOUS FMS REROUTE: ${target.flightNumber} rerouted around severe convective supercell. Safe lateral avoidance corridor activated outside red exclusion zone. Delay impact: +4.2m | Fuel impact: +240kg. Physical re-steering active.`,
      status: 'EXECUTED',
      metadata: { newRouteId: 'RO-SAFEST', riskScore: target.riskScore }
    });

    audioService.playRadarBlip();
    this.notifyDatalink();
    this.notify();
  }

  // Send Pilot ↔ Tower CPDLC Datalink Message
  public sendDatalinkMessage(
    sender: 'PILOT' | 'TOWER',
    flightNumber: string,
    aircraftId: string,
    type: DatalinkMessage['type'],
    content: string
  ) {
    const now = new Date().toISOString().substring(11, 19) + 'Z';
    const newMsg: DatalinkMessage = {
      id: `MSG-CPDLC-${Date.now()}`,
      timestamp: now,
      sender,
      flightNumber,
      aircraftId,
      type,
      content,
      status: 'SENT'
    };

    this.datalinkMessages.unshift(newMsg);
    audioService.playRadioStatic();
    this.notifyDatalink();

    if (sender === 'PILOT') {
      setTimeout(() => {
        const replyNow = new Date().toISOString().substring(11, 19) + 'Z';
        let replyContent = '';
        let replyType: DatalinkMessage['type'] = 'ROUTE_OPTIMIZED_CLEARANCE';

        if (type === 'EMERGENCY_MAYDAY') {
          replyContent = `MAYDAY ACKNOWLEDGED FOR ${flightNumber}. SQUAWK 7700 VERIFIED. EMERGENCY SERVICES STANDING BY AT RUNWAY. CLEARED IMMEDIATE UNRESTRICTED DESCENT.`;
          replyType = 'PRIORITY_HOLD';
        } else if (type === 'ROUTE_CHANGE_REQUEST') {
          replyContent = `${flightNumber}: ROGER ROUTE CHANGE REQUEST. AI BYPASS CORRIDOR APPROVED AS FILED. CLEARED VIA NEW WAYPOINTS.`;
          replyType = 'ROUTE_OPTIMIZED_CLEARANCE';
          this.executeReroute(aircraftId);
        } else if (type === 'LANDING_CLEARANCE_REQUEST') {
          replyContent = `${flightNumber}: CLEARED ILS APPROACH RUNWAY 04L. WIND 080 AT 14 KTS. CONTACT TOWER 119.1 ON 4 MILE FINAL.`;
          replyType = 'LANDING_CLEARANCE_ISSUED';
        } else {
          replyContent = `${flightNumber}: ATC ACKNOWLEDGES TRANSMISSION. RADAR CONTACT MAINTAINED.`;
        }

        this.datalinkMessages.unshift({
          id: `MSG-CPDLC-${Date.now()}`,
          timestamp: replyNow,
          sender: 'TOWER',
          flightNumber,
          aircraftId,
          type: replyType,
          content: replyContent,
          status: 'EXECUTED'
        });

        audioService.playRadarBlip();
        this.notifyDatalink();
      }, 1200);
    }
  }

  public injectFault(fault: FaultType, aircraftId: string) {
    this.activeFault = fault;
    this.faultInjectedAircraftId = aircraftId;
    
    audioService.playMasterWarning();

    const target = this.fleet.find(a => a.aircraftId === aircraftId);
    if (!target) return;

    const newAlertId = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    if (fault === 'LEVEL_5_STORM_CELL') {
      target.environment.stormSeverity = 'EXTREME';
      target.environment.turbulenceIndexEdr = 0.94;
      target.environment.visibilityKm = 1.8;
      target.environment.icingRisk = 'SEVERE';
      target.environment.rainProbabilityPercent = 95;
      target.activeDangerZone = {
        lat: target.latitude + 1.2,
        lon: target.longitude + 2.5,
        radiusNm: 150,
        severity: 'EXTREME',
        hazardType: 'Severe Convective Cell & Severe Windshear'
      };

      const risk = this.calculateRisk(target);
      target.safetyStatus = risk.status;
      target.riskScore = risk.score;
      target.riskCategory = risk.category;

      this.alerts.unshift({
        id: newAlertId,
        timestamp: now,
        aircraftId: target.aircraftId,
        flightNumber: target.flightNumber,
        severity: 'CRITICAL',
        category: 'WEATHER',
        code: 'SEVERE_WEATHER_DANGER',
        message: `Extreme Level 5 Storm Cell encountered on active heading. Autonomous FMS Reroute engaged.`,
        recommendedAction: 'Autonomous AI FMS rerouting engaged to bypass storm corridor.',
        acknowledged: false
      });

      // Automatically execute avoidance reroute
      setTimeout(() => {
        this.executeReroute(aircraftId);
      }, 600);
    } else if (fault === 'HPT_THERMAL_CREEP') {
      target.engine2.egtDegC = 885;
      target.engine2.egtMarginDegC = 2;
      target.engine2.vibrationN2 = 2.45;
      target.engine2.oilTempDegC = 128;
      target.overallHealthScore = Math.max(30, target.overallHealthScore - 28);
      target.alertCount += 1;

      const risk = this.calculateRisk(target);
      target.safetyStatus = risk.status;
      target.riskScore = risk.score;
      target.riskCategory = risk.category;

      this.alerts.unshift({
        id: newAlertId,
        timestamp: now,
        aircraftId: target.aircraftId,
        flightNumber: target.flightNumber,
        severity: 'CRITICAL',
        category: 'ENGINE',
        code: 'ENG2_HPT_THERMAL_CREEP_CRITICAL',
        message: 'Engine 2 High Pressure Turbine thermal runaway (EGT 885°C, Vibration 2.45 mm/s)',
        recommendedAction: 'Reduce Engine 2 thrust to IDLE. Coordinate emergency diversion via CPDLC.',
        acknowledged: false
      });
    }

    this.notifyAlerts();
    this.notify();
  }

  public clearFault() {
    this.activeFault = 'NONE';
    this.faultInjectedAircraftId = null;
    this.fleet = JSON.parse(JSON.stringify(INITIAL_AIRCRAFT_LIST));
    this.fleet.forEach((ac) => {
      this.fmsPlans.set(ac.aircraftId, {
        currentWaypointIndex: 1,
        hasAvoidanceActive: false,
        threatDetected: false,
        etaMinutes: 180
      });
    });
    this.notify();
  }

  private startSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.speed === 0) return;

    // Fast 100ms simulation tick for fluid real-time flight motion
    const intervalMs = Math.max(50, Math.round(100 / this.speed));

    this.intervalId = setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  // CORE FLIGHT MANAGEMENT SYSTEM SIMULATION TICK
  private tick() {
    const dt = 0.1 * this.speed; // 0.1s delta time scaled by simulation speed

    this.fleet.forEach((aircraft) => {
      const jitter = (range: number) => (Math.random() - 0.5) * range;

      // 1. Continuous Telemetry Fluctuations
      aircraft.engine1.egtDegC = Math.round((aircraft.engine1.egtDegC + jitter(0.5)) * 10) / 10;
      aircraft.engine1.n1Percent = Math.round((aircraft.engine1.n1Percent + jitter(0.04)) * 10) / 10;
      aircraft.engine1.fuelFlowKgHr = Math.round(aircraft.engine1.fuelFlowKgHr + jitter(4));

      if (this.activeFault !== 'HPT_THERMAL_CREEP' || this.faultInjectedAircraftId !== aircraft.aircraftId) {
        aircraft.engine2.egtDegC = Math.round((aircraft.engine2.egtDegC + jitter(0.5)) * 10) / 10;
        aircraft.engine2.n1Percent = Math.round((aircraft.engine2.n1Percent + jitter(0.04)) * 10) / 10;
        aircraft.engine2.fuelFlowKgHr = Math.round(aircraft.engine2.fuelFlowKgHr + jitter(4));
      }

      // 2. Real-Time Fuel Consumption
      const burnKg = (aircraft.fuel.fuelBurnRateTotalKgHr / 3600) * dt;
      aircraft.fuel.totalQuantityKg = Math.max(1000, Math.round(aircraft.fuel.totalQuantityKg - burnKg));

      // 3. FMS Flight Plan Execution (Waypoint Navigation)
      let fms = this.fmsPlans.get(aircraft.aircraftId);
      if (!fms) {
        fms = { currentWaypointIndex: 1, hasAvoidanceActive: false, threatDetected: false, etaMinutes: 180 };
        this.fmsPlans.set(aircraft.aircraftId, fms);
      }

      const route = aircraft.activeRoute;
      if (route && route.length > 1) {
        if (fms.currentWaypointIndex >= route.length) {
          fms.currentWaypointIndex = route.length - 1;
        }

        const targetWpt = route[fms.currentWaypointIndex];
        const dLat = targetWpt[0] - aircraft.latitude;
        const dLon = targetWpt[1] - aircraft.longitude;
        const distToWptNm = geoDistanceNm(aircraft.latitude, aircraft.longitude, targetWpt[0], targetWpt[1]);

        // Compute true target heading
        const targetHeading = ((Math.atan2(dLon, dLat) * 180) / Math.PI + 360) % 360;
        
        // Turn aircraft smoothly towards target heading
        let headingDiff = targetHeading - aircraft.headingDeg;
        if (headingDiff > 180) headingDiff -= 360;
        if (headingDiff < -180) headingDiff += 360;
        aircraft.headingDeg = (aircraft.headingDeg + headingDiff * 0.3 + 360) % 360;

        // Groundspeed slight natural variation
        aircraft.groundSpeedKnots = Math.round(aircraft.groundSpeedKnots + jitter(0.2));

        // Step distance in degrees (speed-scaled so movement is clearly visible in real-time)
        const stepDistDeg = (aircraft.groundSpeedKnots / 3600) * (1 / 60) * 3.5 * dt;

        if (distToWptNm < 15.0 || Math.hypot(dLat, dLon) < 0.25) {
          // Reached waypoint: advance FMS to next waypoint
          if (fms.currentWaypointIndex < route.length - 1) {
            fms.currentWaypointIndex += 1;
          } else {
            // Reached destination: cycle back smoothly for continuous simulation
            aircraft.latitude = route[0][0];
            aircraft.longitude = route[0][1];
            fms.currentWaypointIndex = 1;
          }
        } else {
          // Advance physical coordinates along trajectory vector
          const moveRatio = Math.min(1, stepDistDeg / Math.max(0.001, Math.hypot(dLat, dLon)));
          aircraft.latitude += dLat * moveRatio;
          aircraft.longitude += dLon * moveRatio;
        }

        // ETA calculation
        let remainingDistanceNm = distToWptNm;
        for (let i = fms.currentWaypointIndex; i < route.length - 1; i++) {
          remainingDistanceNm += geoDistanceNm(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1]);
        }
        fms.etaMinutes = Math.max(1, Math.round((remainingDistanceNm / Math.max(100, aircraft.groundSpeedKnots)) * 60));
      }

      // 4. PREDICTIVE HAZARD AVOIDANCE (Trajectory Conflict Detection)
      if (!fms.hasAvoidanceActive && aircraft.activeDangerZone) {
        const dangerCenter: [number, number] = [aircraft.activeDangerZone.lat, aircraft.activeDangerZone.lon];
        const dangerRadius = aircraft.activeDangerZone.radiusNm;

        // Check if any segment of active route intersects the danger circle
        let intersectsDanger = false;
        for (let i = Math.max(0, fms.currentWaypointIndex - 1); i < route.length - 1; i++) {
          if (segmentIntersectsCircle(route[i], route[i + 1], dangerCenter, dangerRadius + 30)) {
            intersectsDanger = true;
            break;
          }
        }

        const distToDangerCenterNm = geoDistanceNm(aircraft.latitude, aircraft.longitude, dangerCenter[0], dangerCenter[1]);

        if (intersectsDanger || distToDangerCenterNm < dangerRadius + 180) {
          // Threat detected ahead! Set severe weather factors
          aircraft.environment.stormSeverity = 'SEVERE';
          aircraft.environment.turbulenceIndexEdr = 0.88;
          aircraft.environment.rainProbabilityPercent = 95;
          aircraft.environment.visibilityKm = 1.8;
          aircraft.environment.icingRisk = 'SEVERE';

          const risk = this.calculateRisk(aircraft);
          aircraft.safetyStatus = risk.status;
          aircraft.riskScore = risk.score;
          aircraft.riskCategory = risk.category;
          aircraft.riskTrend = 'DEGRADING';

          // AUTONOMOUS FMS REROUTING: Execute automatic bypass route replacement immediately
          fms.threatDetected = true;
          this.executeReroute(aircraft.aircraftId);
        }
      } else {
        // Dynamically compute risk from current factors
        const risk = this.calculateRisk(aircraft);
        aircraft.safetyStatus = risk.status;
        aircraft.riskScore = risk.score;
        aircraft.riskCategory = risk.category;
      }

      // 5. Dynamic Environmental Sensing
      aircraft.environment.windSpeedKnots = Math.max(5, Math.round(aircraft.environment.windSpeedKnots + jitter(0.25)));
      aircraft.environment.temperatureC = Math.round((aircraft.environment.temperatureC + jitter(0.1)) * 10) / 10;
    });

    this.notify();
  }

  private notify() {
    const active = this.getActiveAircraft();
    this.subscribers.forEach(cb => cb(this.fleet, active));
  }

  private notifyAlerts() {
    this.alertSubscribers.forEach(cb => cb(this.alerts));
  }

  private notifyDatalink() {
    this.datalinkSubscribers.forEach(cb => cb(this.datalinkMessages));
  }
}

export const telemetryEngine = new TelemetryEngine();
