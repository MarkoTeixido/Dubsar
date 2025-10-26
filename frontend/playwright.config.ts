import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout por test
  timeout: 30000,
  
  // Tests en paralelo
  fullyParallel: true,
  
  // Reintentos en CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers (tests simultáneos)
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html'],
    ['list'],
  ],
  
  use: {
    // Base URL
    baseURL: 'http://localhost:3000',
    
    // Screenshots on failure
    screenshot: 'only-on-failure',
    
    // Videos on failure
    video: 'retain-on-failure',
    
    // Traces on failure
    trace: 'on-first-retry',
  },

  // Proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Edge'] },
    },
  ],

  // Web server local
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})