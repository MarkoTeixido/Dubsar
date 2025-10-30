import { test, expect } from '@playwright/test'
import { MockAPI } from '../mocks/mockApi'

test.describe('Autenticación con Modales', () => {
  let mockApi: MockAPI

  test.beforeEach(async ({ page }) => {
    mockApi = new MockAPI(page)
  })

  test('Modal de login se abre correctamente', async ({ page }) => {
    await page.goto('/')
    
    // Click en "Iniciar sesión" del header
    await page.click('button:has-text("Iniciar sesión")')
    
    // Verificar que el modal se abre
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible({ timeout: 5000 })
    
    // Verificar tabs (usar selectores más específicos)
    await expect(page.locator('div[role="dialog"] .flex.gap-2 button:has-text("Iniciar sesión")')).toBeVisible()
    await expect(page.locator('div[role="dialog"] .flex.gap-2 button:has-text("Registrarse")')).toBeVisible()
  })

  test('Modal de register se abre correctamente', async ({ page }) => {
    await page.goto('/')
    
    // Click en "Registrarse" del header
    await page.click('button:has-text("Registrarse")')
    
    // Verificar que el modal se abre
    await expect(page.getByRole('heading', { name: /Bienvenido de nuevo|Crear cuenta/i })).toBeVisible({ timeout: 5000 })
    
    // Click en tab de registrarse usando selector más específico (dentro del contenedor de tabs)
    await page.locator('div[role="dialog"] .flex.gap-2 button').filter({ hasText: 'Registrarse' }).click()
    
    // Verificar título
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible({ timeout: 5000 })
  })

  test('Usuario puede hacer login con credenciales mockeadas', async ({ page }) => {
    // Mock del login
    await mockApi.mockLoginSuccess()
    await mockApi.mockGetProfile()
    await mockApi.mockGetConversations()
    await mockApi.mockChatStream()
    
    await page.goto('/')
    
    // Abrir modal de login
    await page.click('button:has-text("Iniciar sesión")')
    
    // Esperar a que cargue el modal completamente
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible({ timeout: 5000 })
    
    // Esperar a que los campos del formulario estén disponibles
    const emailInput = page.locator('div[role="dialog"] input[type="email"]')
    const passwordInput = page.locator('div[role="dialog"] input[type="password"]')
    
    await expect(emailInput).toBeVisible({ timeout: 5000 })
    await expect(passwordInput).toBeVisible({ timeout: 5000 })
    
    // Llenar formulario
    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')
    
    // Click en botón de "Iniciar sesión" del formulario
    await page.locator('div[role="dialog"] button[type="submit"]').filter({ hasText: 'Iniciar sesión' }).click()
    
    // Verificar que el modal se cierra
    await expect(page.locator('text=Bienvenido de nuevo')).not.toBeVisible({ timeout: 5000 })
  })

  test('Modal se cierra al hacer click en X', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Abrir modal
    await page.click('button:has-text("Iniciar sesión")')
    
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible({ timeout: 5000 })
    
    // Click en botón de cerrar (X)
    await page.locator('button[aria-label="Cerrar"]').click()
    
    // Verificar que se cierra
    await expect(page.locator('text=Bienvenido de nuevo')).not.toBeVisible({ timeout: 2000 })
  })

  test('Usuario puede cambiar entre tabs de Login y Register', async ({ page }) => {
    await page.goto('/')
    
    await page.click('button:has-text("Iniciar sesión")')
    
    // Verificar que estamos en login
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible()
    
    // Click en tab de Registrarse usando selector específico
    await page.locator('div[role="dialog"] .flex.gap-2 button').filter({ hasText: 'Registrarse' }).click()
    
    // Verificar que cambió a registro
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible({ timeout: 3000 })
    
    // Volver a login
    await page.locator('div[role="dialog"] .flex.gap-2 button').filter({ hasText: 'Iniciar sesión' }).click()
    
    // Verificar que volvió
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible({ timeout: 3000 })
  })
})