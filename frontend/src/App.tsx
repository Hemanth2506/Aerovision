import React, { useState, useEffect } from 'react';
import { 
  AircraftTelemetry, 
  OperationalAlert, 
  UserPersona, 
  ViewPerspective, 
  DatalinkMessage,
  MaintenanceWorkOrder 
} from './types';
import { USER_PERSONAS, INITIAL_WORK_ORDERS } from './data/mockData';
import { telemetryEngine } from './services/telemetryEngine';
import { Navbar } from './components/common/Navbar';
import { Sidebar, ActiveModule } from './components/common/Sidebar';

// Dual Perspectives
import { ATCTowerView } from './components/ATC/ATCTowerView';
import { PilotCockpitView } from './components/Cockpit/PilotCockpitView';

// Core Intelligence Modules
import { LiveFleetMonitoring } from './components/Fleet/LiveFleetMonitoring';
import { PredictiveMaintenanceCenter } from './components/Maintenance/PredictiveMaintenanceCenter';
import { DigitalTwinView } from './components/DigitalTwin/DigitalTwinView';
import { FlightSafetyCenter } from './components/Safety/FlightSafetyCenter';
import { AeroAIAssistant } from './components/AeroAI/AeroAIAssistant';
import { AirportOperationsCenter } from './components/Airport/AirportOperationsCenter';
import { WeatherIntelligenceCenter } from './components/Weather/WeatherIntelligenceCenter';
import { FuelSustainabilityCenter } from './components/Fuel/FuelSustainabilityCenter';
import { ExecutiveDashboard } from './components/Executive/ExecutiveDashboard';
import { ReportsCenter } from './components/Reports/ReportsCenter';

export const App: React.FC = () => {
  const [fleet, setFleet] = useState<AircraftTelemetry[]>(telemetryEngine.getFleet());
  const [activeAircraft, setActiveAircraft] = useState<AircraftTelemetry>(telemetryEngine.getActiveAircraft());
  const [alerts, setAlerts] = useState<OperationalAlert[]>(telemetryEngine.getAlerts());
  const [workOrders] = useState<MaintenanceWorkOrder[]>(INITIAL_WORK_ORDERS);
  const [datalinkMessages, setDatalinkMessages] = useState<DatalinkMessage[]>(telemetryEngine.getDatalinkMessages());
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(USER_PERSONAS[0]);
  const [perspective, setPerspective] = useState<ViewPerspective>('ATC_TOWER');
  const [activeModule, setActiveModule] = useState<ActiveModule>('ATC_TOWER');

  useEffect(() => {
    const unsubTelemetry = telemetryEngine.subscribe((newFleet, active) => {
      setFleet([...newFleet]);
      setActiveAircraft({ ...active });
    });

    const unsubAlerts = telemetryEngine.subscribeAlerts((newAlerts) => {
      setAlerts([...newAlerts]);
    });

    const unsubDatalink = telemetryEngine.subscribeDatalink((newMsgs) => {
      setDatalinkMessages([...newMsgs]);
    });

    return () => {
      unsubTelemetry();
      unsubAlerts();
      unsubDatalink();
    };
  }, []);

  const handleSelectAircraft = (aircraftId: string) => {
    telemetryEngine.setActiveAircraft(aircraftId);
  };

  const handleSelectPerspective = (newPerspective: ViewPerspective) => {
    setPerspective(newPerspective);
    setActiveModule(newPerspective === 'ATC_TOWER' ? 'ATC_TOWER' : 'PILOT_COCKPIT');
  };

  const handleSelectModule = (mod: ActiveModule) => {
    setActiveModule(mod);
    if (mod === 'ATC_TOWER') setPerspective('ATC_TOWER');
    if (mod === 'PILOT_COCKPIT') setPerspective('PILOT_COCKPIT');
  };

  const dangerCount = fleet.filter(a => a.safetyStatus === 'DANGER').length;

  return (
    <div className="min-h-screen bg-aerospace-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-hud-cyan selection:text-black">
      {/* Top Aerospace Navbar */}
      <Navbar
        perspective={perspective}
        onSelectPerspective={handleSelectPerspective}
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        activeAircraft={activeAircraft}
        fleet={fleet}
        onSelectAircraft={handleSelectAircraft}
        alerts={alerts}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          dangerAlertCount={dangerCount}
        />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aerospace-900/60 via-aerospace-950 to-black">
          {activeModule === 'ATC_TOWER' && (
            <ATCTowerView
              fleet={fleet}
              activeAircraft={activeAircraft}
              onSelectAircraft={handleSelectAircraft}
              alerts={alerts}
              datalinkMessages={datalinkMessages}
            />
          )}

          {activeModule === 'PILOT_COCKPIT' && (
            <PilotCockpitView
              telemetry={activeAircraft}
              datalinkMessages={datalinkMessages}
            />
          )}

          {activeModule === 'FLEET' && (
            <LiveFleetMonitoring
              fleet={fleet}
              activeAircraft={activeAircraft}
              onSelectAircraft={handleSelectAircraft}
              alerts={alerts}
            />
          )}

          {activeModule === 'MAINTENANCE' && (
            <PredictiveMaintenanceCenter
              telemetry={activeAircraft}
            />
          )}

          {activeModule === 'DIGITAL_TWIN' && (
            <DigitalTwinView
              telemetry={activeAircraft}
            />
          )}

          {activeModule === 'SAFETY' && (
            <FlightSafetyCenter
              telemetry={activeAircraft}
            />
          )}

          {activeModule === 'AERO_AI' && (
            <div className="max-w-4xl mx-auto">
              <AeroAIAssistant
                activeAircraft={activeAircraft}
              />
            </div>
          )}

          {activeModule === 'AIRPORT' && (
            <AirportOperationsCenter />
          )}

          {activeModule === 'WEATHER' && (
            <WeatherIntelligenceCenter />
          )}

          {activeModule === 'FUEL' && (
            <FuelSustainabilityCenter
              telemetry={activeAircraft}
            />
          )}

          {activeModule === 'EXECUTIVE' && (
            <ExecutiveDashboard
              fleet={fleet}
              workOrders={workOrders}
              alerts={alerts}
              onOpenReports={() => setActiveModule('REPORTS')}
            />
          )}

          {activeModule === 'REPORTS' && (
            <ReportsCenter
              telemetry={activeAircraft}
              fleet={fleet}
              workOrders={workOrders}
              alerts={alerts}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
