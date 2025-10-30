import { test, expect } from '@playwright/test'

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Cargar la página una sola vez con mejor timeout
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
  })

  test('Toggle de dark mode funciona', async ({ page }) => {
    // Buscar el botón de dark mode por su title attribute
    const darkModeButton = page.locator('button[title*="Modo"]')
    
    // Esperar que el botón esté visible
    await expect(darkModeButton).toBeVisible({ timeout: 5000 })
    
    // Obtener el color de fondo del body ANTES del toggle
    const bodyBefore = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    // Click en toggle
    await darkModeButton.click()
    
    // Esperar a que se aplique la transición
    await page.waitForTimeout(600)
    
    // Obtener el color de fondo del body DESPUÉS del toggle
    const bodyAfter = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    // Verificar que cambió
    expect(bodyAfter).not.toBe(bodyBefore)
  })

  test('Dark mode persiste después de refresh', async ({ page }) => {
    const darkModeButton = page.locator('button[title*="Modo"]')
    
    // Esperar que el botón esté visible
    await expect(darkModeButton).toBeVisible({ timeout: 5000 })
    
    // Activar dark mode
    await darkModeButton.click()
    await page.waitForTimeout(600)
    
    // Obtener color después de activar
    const bodyAfterToggle = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    // Recargar página con timeout más corto y sin esperar tanto
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 })
    
    // Esperar a que cargue el elemento principal
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
    
    // Esperar a que se aplique el dark mode guardado
    await page.waitForTimeout(600)
    
    // Obtener color después de recargar
    const bodyAfterReload = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    // Verificar que se mantuvo el dark mode
    expect(bodyAfterReload).toBe(bodyAfterToggle)
  })

  test('Clase dark se aplica correctamente al html', async ({ page }) => {
    const darkModeButton = page.locator('button[title*="Modo"]')
    
    // Esperar que el botón esté visible
    await expect(darkModeButton).toBeVisible({ timeout: 5000 })
    
    // Verificar estado inicial (puede ser light o dark según preferencia del sistema)
    const htmlElement = page.locator('html')
    
    // Hacer toggle
    await darkModeButton.click()
    await page.waitForTimeout(600)
    
    // Obtener la clase después del toggle
    const classAfterFirstToggle = await htmlElement.getAttribute('class')
    
    // Hacer toggle de nuevo
    await darkModeButton.click()
    await page.waitForTimeout(600)
    
    // Obtener la clase después del segundo toggle
    const classAfterSecondToggle = await htmlElement.getAttribute('class')
    
    // Verificar que las clases cambiaron
    expect(classAfterFirstToggle).not.toBe(classAfterSecondToggle)
  })
})