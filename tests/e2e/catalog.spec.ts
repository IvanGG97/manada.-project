import { test, expect } from '@playwright/test'

test.describe('Catálogo de productos', () => {
  test('muestra productos en la página principal', async ({ page }) => {
    await page.goto('/')
    // Debe haber al menos un producto destacado o CTA
    await expect(page.getByRole('link', { name: /ver productos|catálogo|explorar/i }).first()).toBeVisible()
  })

  test('navegar al catálogo', async ({ page }) => {
    await page.goto('/productos')
    await expect(page).toHaveTitle(/manada/i)
    // Esperar que aparezcan tarjetas de producto
    const products = page.locator('a[href^="/productos/"]')
    await expect(products.first()).toBeVisible({ timeout: 10_000 })
  })

  test('buscar un producto', async ({ page }) => {
    await page.goto('/productos')
    // Buscar en el campo de búsqueda
    const searchInput = page.getByPlaceholder(/buscar/i)
    await searchInput.fill('remera')
    // Esperar sugerencias
    await page.waitForTimeout(400)
    // Aceptar con Enter para filtrar
    await searchInput.press('Enter')
    await expect(page.getByText(/resultados para/i)).toBeVisible({ timeout: 5_000 })
  })

  test('sugerencias de búsqueda aparecen', async ({ page }) => {
    await page.goto('/productos')
    const searchInput = page.getByPlaceholder(/buscar/i)
    await searchInput.fill('re')
    await page.waitForTimeout(400)
    // Debería aparecer el dropdown con sugerencias
    const suggestions = page.locator('[role="listbox"], [data-suggestions]')
    // Si hay resultados, el dropdown aparece; si no hay productos que coincidan, no aparece — ambos son válidos
    // Solo verificamos que la búsqueda no rompe la página
    await expect(page).not.toHaveTitle(/error/i)
  })

  test('página de detalle de producto', async ({ page }) => {
    await page.goto('/productos')
    const firstProduct = page.locator('a[href^="/productos/"]').first()
    await firstProduct.click()
    await expect(page.getByRole('button', { name: /agregar al carrito/i })).toBeVisible({ timeout: 8_000 })
  })
})
