export type AircraftStatus = 
  | 'AIRBORNE' 
  | 'CRUISING' 
  | 'CLIMBING' 
  | 'DESCENDING' 
  | 'TAXIING' 
  | 'APPROACH'
  | 'GROUND_HOLD' 
  | 'MAINTENANCE_DUE' 
  | 'AOG_CRITICAL'
  | 'EMERGENCY_DIVERSION';

export type HealthRiskCategory = 'SAFE' | 'CAUTION' | 'DANGER';

export type MaintenanceUrgency = 'ROUTINE' | 'ADVISORY' | 'URGENT_24H' | 'AOG_CRITICAL';

export type ATADivision = 
  | 'ATA-21 Air Conditioning & Pressurization'
  | 'ATA-24 Electrical Power'
  | 'ATA-27 Flight Controls'
  | 'ATA-29 Hydraulic Power'
  | 'ATA-32 Landing Gear & Brakes'
  | 'ATA-34 Navigation & Pitot-Static'
  | 'ATA-49 Auxiliary Power Unit (APU)'
  | 'ATA-72 Engine / Turbofan Core'
  | 'ATA-73 Engine Fuel & Control'
  | 'ATA-77 Engine Indicating';

export interface AircraftSubsystemHealth {
  id: string;
  name: string;
  ataChapter: string;
  healthScore: number; // 0 - 100
  rulHours: number; // Remaining Useful Life in flight hours
  rulCycles: number; // Remaining cycles
  failureProbability: number; // 0 - 1.0
  status: 'OPTIMAL' | 'DEGRADED' | 'WARNING' | 'CRITICAL';
  vibrationMmSec: number;
  temperatureC: number;
  pressurePsi: number;
  lastOverhaulDate: string;
  nextScheduledCheck: string;
  anomaliesDetected: string[];
}

export interface Waypoint {
  name: string;
  lat: number;
  lon: number;
  altitudeFt?: number;
  isDangerZone?: boolean;
}

export interface RouteOption {
  id: string;
  name: string;
  type: 'ORIGINAL' | 'SAFEST' | 'SHORTEST_DELAY' | 'FUEL_EFFICIENT';
  waypoints: [number, number][];
  distanceNm: number;
  estimatedTimeMin: number;
  fuelBurnKg: number;
  co2EmissionsKg: number;
  riskScore: number;
  description: string;
  isRecommended?: boolean;
}

export interface EnvironmentMetrics {
  temperatureC: number;
  humidityPercent: number;
  windSpeedKnots: number;
  windDirectionDeg: number;
  visibilityKm: number;
  airPressureHpa: number;
  turbulenceIndexEdr: number; // 0 to 1.0 (EDR Energy Dissipation Rate)
  rainProbabilityPercent: number;
  stormSeverity: 'NIL' | 'LIGHT' | 'MODERATE' | 'SEVERE' | 'EXTREME';
  cloudDensityPercent: number;
  icingRisk: 'LOW' | 'MEDIUM' | 'SEVERE';
}

export interface RiskFactor {
  name: string;
  impactScore: number; // 0 to 100
  category: 'WEATHER' | 'TECHNICAL' | 'AIRSPACE' | 'FUEL' | 'ROUTE';
  description: string;
  severity: 'SAFE' | 'CAUTION' | 'DANGER';
}

export interface AircraftTelemetry {
  flightNumber: string;
  aircraftId: string;
  tailNumber: string;
  model: string; // e.g. "Boeing 787-9 Dreamliner"
  airline: string;
  origin: string;
  originIata: string;
  destination: string;
  destIata: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  groundSpeedKnots: number;
  headingDeg: number;
  verticalSpeedFpm: number;
  squawk: string;
  phase: AircraftStatus;
  
  // Status System (SAFE = Green, CAUTION = Yellow, DANGER = Red)
  safetyStatus: HealthRiskCategory;
  overallHealthScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskTrend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  contributingRiskFactors: RiskFactor[];
  alertCount: number;

  // Flight Route & AI Dynamic Rerouting
  originalRoute: [number, number][];
  activeRoute: [number, number][];
  optimizedRoute?: [number, number][];
  isRerouted: boolean;
  activeDangerZone?: {
    lat: number;
    lon: number;
    radiusNm: number;
    severity: string;
    hazardType: string;
  };
  rerouteOptions?: RouteOption[];

  // Live Environment Telemetry
  environment: EnvironmentMetrics;

  // Engine 1 & Engine 2 Live Metrics
  engine1: {
    egtDegC: number;
    egtMarginDegC: number;
    n1Percent: number;
    n2Percent: number;
    fuelFlowKgHr: number;
    oilPressurePsi: number;
    oilTempDegC: number;
    vibrationN1: number;
    vibrationN2: number;
    thrustKn: number;
  };
  engine2: {
    egtDegC: number;
    egtMarginDegC: number;
    n1Percent: number;
    n2Percent: number;
    fuelFlowKgHr: number;
    oilPressurePsi: number;
    oilTempDegC: number;
    vibrationN1: number;
    vibrationN2: number;
    thrustKn: number;
  };

  // Systems telemetry
  hydraulics: {
    systemAPressurePsi: number;
    systemBPressurePsi: number;
    systemCPressurePsi: number;
    fluidTempC: number;
  };
  avionics: {
    cabinAltitudeFt: number;
    differentialPressurePsi: number;
    electricalBusVoltageV: number;
    batteryChargePercent: number;
    pitotStaticDiff: number;
  };
  fuel: {
    totalQuantityKg: number;
    leftTankKg: number;
    rightTankKg: number;
    centerTankKg: number;
    fuelBurnRateTotalKgHr: number;
    costIndex: number;
    co2EmissionsKgPerNm: number;
  };
  flightControls: {
    flapsDeg: number;
    slatsExtended: boolean;
    rudderDeflectionDeg: number;
    elevatorDeflectionDeg: number;
    aileronDeflectionDeg: number;
    speedbrakePercent: number;
    gearExtended: boolean;
  };

  subsystems: AircraftSubsystemHealth[];
}

export interface DatalinkMessage {
  id: string;
  timestamp: string;
  sender: 'PILOT' | 'TOWER' | 'AI_SYSTEM';
  flightNumber: string;
  aircraftId: string;
  type: 
    | 'ROUTE_CHANGE_REQUEST'
    | 'ROUTE_OPTIMIZED_CLEARANCE'
    | 'EMERGENCY_MAYDAY'
    | 'TECHNICAL_ANOMALY_REPORT'
    | 'WEATHER_UPDATE_REQUEST'
    | 'WEATHER_ALERT_BROADCAST'
    | 'LANDING_CLEARANCE_REQUEST'
    | 'LANDING_CLEARANCE_ISSUED'
    | 'PRIORITY_HOLD'
    | 'MAINTENANCE_ADVISORY';
  content: string;
  status: 'SENT' | 'ACKNOWLEDGED' | 'EXECUTED' | 'REJECTED';
  metadata?: {
    newRouteId?: string;
    assignedRunway?: string;
    squawk?: string;
    riskScore?: number;
  };
}

export interface MaintenanceWorkOrder {
  id: string;
  aircraftId: string;
  tailNumber: string;
  ataChapter: string;
  title: string;
  description: string;
  urgency: MaintenanceUrgency;
  healthImpactScore: number;
  estimatedLaborHours: number;
  requiredParts: string[];
  assignedTechnician: string;
  status: 'PENDING_APPROVAL' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED_MEL';
  createdTimestamp: string;
  dueTimestamp: string;
  predictedFailureRisk: number;
  costEstimateUsd: number;
}

export interface OperationalAlert {
  id: string;
  timestamp: string;
  aircraftId: string;
  flightNumber: string;
  severity: 'INFO' | 'CAUTION' | 'WARNING' | 'CRITICAL';
  category: 'ENGINE' | 'HYDRAULICS' | 'AVIONICS' | 'WEATHER' | 'SAFETY' | 'FUEL' | 'ROUTE_CONFLICT';
  code: string;
  message: string;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface FOQAExceedance {
  id: string;
  flightNumber: string;
  aircraftModel: string;
  event: string;
  severity: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3_CRITICAL';
  phaseOfFlight: string;
  measuredValue: string;
  thresholdLimit: string;
  timestamp: string;
  riskAssessment: string;
}

export interface AirportTurnaround {
  airportCode: string;
  airportName: string;
  runways: {
    name: string;
    heading: number;
    status: 'ACTIVE' | 'CONGESTED' | 'MAINTENANCE';
    windComponentKnots: string;
    utilizationPercent: number;
    assignedArrivals: string[];
  }[];
  activeGates: {
    gate: string;
    flightNumber: string;
    aircraftType: string;
    status: 'DEPLANING' | 'REFUELING' | 'CATERING' | 'BAGGAGE' | 'BOARDING' | 'PUSHBACK_READY';
    progressPercent: number;
    targetDepartureTime: string;
    delayMinutes: number;
  }[];
  landingQueue: {
    flightNumber: string;
    aircraftModel: string;
    etaMinutes: number;
    assignedRunway: string;
    priorityLevel: 'ROUTINE' | 'EXPEDITE' | 'EMERGENCY';
    status: 'EN_ROUTE' | 'ON_APPROACH' | 'FINAL_APPROACH' | 'TOUCHDOWN';
  }[];
  congestionIndex: number;
  averageTaxiOutMinutes: number;
  metarRaw: string;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
}

export interface WeatherAdvisory {
  id: string;
  type: 'SIGMET' | 'AIRMET' | 'PIREP' | 'TURBULENCE_WARNING';
  region: string;
  coordinates: [number, number][];
  intensity: 'MODERATE' | 'SEVERE' | 'EXTREME';
  altitudeRange: string;
  description: string;
  validUntil: string;
}

export type ViewPerspective = 'ATC_TOWER' | 'PILOT_COCKPIT';

export type UserRole = 
  | 'OPERATIONS_MANAGER'
  | 'MAINTENANCE_ENGINEER'
  | 'SAFETY_OFFICER'
  | 'AIRPORT_ADMIN'
  | 'EXECUTIVE_LEADERSHIP';

export interface UserPersona {
  role: UserRole;
  displayName: string;
  title: string;
  avatar: string;
  badge: string;
  primaryFocus: string;
}

export interface AICopilotMessage {
  id: string;
  sender: 'USER' | 'AERO_AI';
  timestamp: string;
  text: string;
  telemetryContext?: {
    aircraftId?: string;
    faultCode?: string;
    confidenceScore?: number;
    ammReference?: string;
  };
}
