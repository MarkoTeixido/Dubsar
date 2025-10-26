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
    
    // Verificar tabs
    await expect(page.locator('button:has-text("Iniciar sesión")').first()).toBeVisible()
    await expect(page.locator('button:has-text("Registrarse")').first()).toBeVisible()
  })

  test('Modal de register se abre correctamente', async ({ page }) => {
    await page.goto('/')
    
    // Click en "Registrarse" del header
    await page.click('button:has-text("Registrarse")')
    
    // Verificar que el modal se abre (buscar dentro del modal, no en el header)
    await expect(page.getByRole('heading', { name: /Bienvenido de nuevo|Crear cuenta/i })).toBeVisible({ timeout: 5000 })
    
    // Click en tab de registrarse si no está activo (con force porque puede estar cubierto por overlay)
    await page.locator('div[role="dialog"] button:has-text("Registrarse")').click({ force: true })
    
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
    
    // Esperar a que cargue el modal
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible({ timeout: 5000 })
    
    // Llenar formulario (dentro del modal)
    await page.locator('div[role="dialog"] input[type="email"]').fill('test@example.com')
    await page.locator('div[role="dialog"] input[type="password"]').fill('password123')
    
    // Click en botón de "Iniciar sesión" del formulario (dentro del modal)
    await page.locator('div[role="dialog"] button[type="submit"]:has-text("Iniciar sesión")').click({ force: true })
    
    // Verificar que el modal se cierra
    await expect(page.locator('text=Bienvenido de nuevo')).not.toBeVisible({ timeout: 5000 })
  })

  test('Modal se cierra al hacer click en X', async ({ page }) => {
    await page.goto('/')
    
    // Abrir modal
    await page.click('button:has-text("Iniciar sesión")')
    
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible({ timeout: 5000 })
    
    // Click en botón de cerrar (X) con force
    await page.locator('button[aria-label="Cerrar"]').click({ force: true })
    
    // Verificar que se cierra
    await expect(page.locator('text=Bienvenido de nuevo')).not.toBeVisible({ timeout: 2000 })
  })

  test('Usuario puede cambiar entre tabs de Login y Register', async ({ page }) => {
    await page.goto('/')
    
    await page.click('button:has-text("Iniciar sesión")')
    
    // Verificar que estamos en login
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible()
    
    // Click en tab de Registrarse (dentro del modal con force)
    await page.locator('div[role="dialog"] button:has-text("Registrarse")').first().click({ force: true })
    
    // Verificar que cambió a registro
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible({ timeout: 3000 })
    
    // Volver a login (con force)
    await page.locator('div[role="dialog"] button:has-text("Iniciar sesión")').first().click({ force: true })
    
    // Verificar que volvió
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible({ timeout: 3000 })
  })
})