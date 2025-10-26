import { test, expect } from '@playwright/test'

test.describe('Dark Mode', () => {
  test('Toggle de dark mode funciona', async ({ page }) => {
    await page.goto('/')
    
    // Esperar a que cargue
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
    
    // Buscar el botón de dark mode por su title attribute
    const darkModeButton = page.locator('button[title*="Modo"]')
    
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
    await page.goto('/')
    
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
    
    const darkModeButton = page.locator('button[title*="Modo"]')
    
    // Activar dark mode
    await darkModeButton.click()
    await page.waitForTimeout(600)
    
    // Obtener color después de activar
    const bodyAfterToggle = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    // Recargar página
    await page.reload()
    
    // Esperar a que cargue
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
})