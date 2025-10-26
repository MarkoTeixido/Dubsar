import { test, expect } from '@playwright/test'

test.describe('Conversaciones', () => {
  test('Usuario anónimo puede crear nueva conversación', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
    
    // Click en "Nueva conversación" del sidebar
    await page.click('button:has-text("Nueva conversación")')
    
    // Esperar un momento para que se cree
    await page.waitForTimeout(1000)
    
    // Verificar que se crea buscando en el sidebar (dentro del listitem, no el botón)
    await expect(page.getByRole('listitem').getByText('Nueva conversación').first()).toBeVisible({ timeout: 5000 })
  })

  test('Conversación aparece en sidebar después de enviar mensaje', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
    
    // Enviar un mensaje
    const textarea = page.locator('textarea[placeholder*="Escribe tu mensaje"]')
    await textarea.fill('Test de conversación')
    await page.locator('button[type="button"]').last().click()
    
    // Esperar un momento
    await page.waitForTimeout(1000)
    
    // Verificar que aparece "Nueva conversación" en el sidebar (dentro de listitem)
    await expect(page.getByRole('listitem').getByText('Nueva conversación')).toBeVisible({ timeout: 5000 })
  })

  test('Sidebar tiene sección de agrupación visible', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
    
    // Enviar mensaje para crear conversación
    const textarea = page.locator('textarea[placeholder*="Escribe tu mensaje"]')
    await textarea.fill('Test')
    await page.locator('button[type="button"]').last().click()
    
    // Esperar a que aparezca
    await page.waitForTimeout(1000)
    
    // Verificar que existe alguna sección de agrupación (HOY, AYER, etc.)
    // Como es una conversación nueva, debería aparecer en "HOY" o similar
    const groupSection = page.locator('text=/HOY|AYER|ÚLTIMOS 7 DÍAS|ESTE MES/i').first()
    await expect(groupSection).toBeVisible({ timeout: 5000 })
  })

  test('Input de búsqueda de conversaciones está visible', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
    
    // Verificar input de búsqueda
    await expect(page.locator('input[placeholder*="Buscar conversaciones"]')).toBeVisible()
  })

  test('Botón de nueva conversación está siempre visible', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
    
    // Verificar que el botón existe
    await expect(page.getByRole('button', { name: 'Nueva conversación' })).toBeVisible()
  })

  test('Conversación creada tiene título por defecto', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
    
    // Enviar mensaje
    const textarea = page.locator('textarea[placeholder*="Escribe tu mensaje"]')
    await textarea.fill('Hola')
    await page.locator('button[type="button"]').last().click()
    
    // Esperar
    await page.waitForTimeout(1000)
    
    // Verificar que tiene el título "Nueva conversación"
    const conversationItem = page.getByRole('listitem').filter({ hasText: 'Nueva conversación' }).first()
    await expect(conversationItem).toBeVisible()
  })
})