/**
 * AeroVision API Client Service
 * Configured with VITE_API_URL (defaults to deployed Render backend URL)
 */

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  '';

export interface HealthResponse {
  status: string;
  platform: string;
  service: string;
}

export interface RULPredictionResponse {
  rul_hours: number;
  rul_cycles: number;
  failure_probability: number;
  health_score: number;
  prognostic_status: string;
}

export const apiClient = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async checkHealth(): Promise<HealthResponse> {
    const url = API_BASE_URL ? `${API_BASE_URL}/health` : '/health';
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return res.json();
  },

  async predictRUL(data: { current_egt: number; current_vib: number; flight_cycles: number }): Promise<RULPredictionResponse> {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/maintenance/predict-rul` : '/api/maintenance/predict-rul';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`RUL prediction failed with status: ${res.status}`);
    }
    return res.json();
  },

  async queryCopilot(query: string, flightNumber?: string, aircraftModel?: string) {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/ai/copilot-query` : '/api/ai/copilot-query';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        flight_number: flightNumber || 'AV-101',
        aircraft_model: aircraftModel || 'Boeing 787-9',
      }),
    });
    if (!res.ok) {
      throw new Error(`Copilot query failed with status: ${res.status}`);
    }
    return res.json();
  }
};
