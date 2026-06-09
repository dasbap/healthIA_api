export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
  grafanaUrl: import.meta.env.VITE_GRAFANA_URL ?? 'http://localhost:3002'
};
