import { test, expect } from '@playwright/test'
import { MockAPI } from '../mocks/mockApi'

test.describe('Profile Modal', () => {
  let mockApi: MockAPI

  test.beforeEach(async ({ page }) => {
    mockApi = new MockAPI(page)
    
    // Setup usuario autenticado
    await mockApi.setupAuthenticatedUser()
    await page.goto('/')
    
    // Esperar a que cargue
    await expect(page.locator('text=DUBSAR')).toBeVisible({ timeout: 10000 })
  })

  test('Modal de perfil se abre desde el sidebar', async ({ page }) => {
    // Click en el botón de perfil del sidebar (puede ser un avatar o botón)
    
    // Si no existe con texto, buscar por posición (último botón del sidebar footer)
    const sidebarFooter = page.locator('[data-sidebar="footer"]')
    const footerButtons = sidebarFooter.locator('button')
    
    // Intentar con el primer botón del footer
    const buttonCount = await footerButtons.count()
    if (buttonCount > 0) {
      await footerButtons.first().click()
      
      // Verificar que se abre un menú o modal
      await page.waitForTimeout(500)
      
      // Buscar opción de "Perfil" o "Mi cuenta"
      const profileOption = page.locator('text=/perfil|mi cuenta|configuración/i').first()
      
      if (await profileOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await profileOption.click()
      }
    }
    
    // Verificar que el modal de perfil se abre
    // Puede tener título como "Mi Perfil" o "Configuración"
    const profileModal = page.locator('text=/mi perfil|perfil|configuración de cuenta/i')
    await expect(profileModal).toBeVisible({ timeout: 5000 })
  })

  test('Modal de perfil muestra información del usuario', async ({ page }) => {
    // Abrir modal de perfil (repetir lógica del test anterior)
    const sidebarFooter = page.locator('[data-sidebar="footer"]')
    const footerButtons = sidebarFooter.locator('button')
    
    if (await footerButtons.count() > 0) {
      await footerButtons.first().click()
      await page.waitForTimeout(500)
      
      const profileOption = page.locator('text=/perfil|mi cuenta|configuración/i').first()
      if (await profileOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await profileOption.click()
      }
    }
    
    // Esperar a que el modal cargue
    await page.waitForTimeout(1000)
    
    // Verificar que muestra el email del usuario mockeado
    const userEmail = page.locator('text=test@example.com')
    await expect(userEmail).toBeVisible({ timeout: 5000 })
  })

  test('Modal de perfil tiene botón de cerrar sesión', async ({ page }) => {
    // Abrir modal
    const sidebarFooter = page.locator('[data-sidebar="footer"]')
    const footerButtons = sidebarFooter.locator('button')
    
    if (await footerButtons.count() > 0) {
      await footerButtons.first().click()
      await page.waitForTimeout(500)
      
      const profileOption = page.locator('text=/perfil|mi cuenta|configuración/i').first()
      if (await profileOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await profileOption.click()
      }
    }
    
    // Buscar botón de logout
    const logoutButton = page.locator('button:has-text("Cerrar sesión"), button:has-text("Logout"), button:has-text("Salir")')
    await expect(logoutButton.first()).toBeVisible({ timeout: 5000 })
  })

  test('Modal de perfil se puede cerrar', async ({ page }) => {
    // Abrir modal
    const sidebarFooter = page.locator('[data-sidebar="footer"]')
    const footerButtons = sidebarFooter.locator('button')
    
    if (await footerButtons.count() > 0) {
        await footerButtons.first().click()
        await page.waitForTimeout(500)
        
        const profileOption = page.locator('text=/perfil|mi cuenta|configuración/i').first()
        if (await profileOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await profileOption.click()
        }
    }
    
    // Esperar a que el modal se abra completamente
    await expect(page.locator('text=Mi Perfil')).toBeVisible({ timeout: 5000 })
    
    // Verificar que el email del usuario está visible
    await expect(page.locator('text=test@example.com')).toBeVisible()
    
    // Cerrar con Escape (Radix UI Dialog responde automáticamente)
    await page.keyboard.press('Escape')
    
    // Esperar animación de salida (motion exit tiene 200ms)
    await page.waitForTimeout(500)
    
    // Verificar que el modal desapareció
    await expect(page.locator('text=Mi Perfil')).not.toBeVisible({ timeout: 3000 })
  })
})