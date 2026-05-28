import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/auth'

test.describe('Panel de administración', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('dashboard muestra métricas', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 8_000 })
  })

  test('lista de productos', async ({ page }) => {
    await page.goto('/admin/productos')
    await expect(page.getByRole('link', { name: /nuevo producto/i })).toBeVisible({ timeout: 8_000 })
  })

  test('crear un producto nuevo', async ({ page }) => {
    await page.goto('/admin/productos/nuevo')
    // Los inputs del ProductForm no tienen label asociado (sin htmlFor)
    // Usamos name del input directamente
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 8_000 })

    await page.locator('input[name="name"]').fill('Producto de prueba Playwright')
    await page.locator('input[name="price"]').fill('999')
    await page.locator('input[name="stock"]').fill('10')

    await page.getByRole('button', { name: /guardar|crear|agregar/i }).click()
    await expect(page).toHaveURL(/\/admin\/productos/, { timeout: 10_000 })
  })

  test('lista de órdenes', async ({ page }) => {
    await page.goto('/admin/ordenes')
    await expect(page).not.toHaveTitle(/error/i)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8_000 })
  })

  test('lista de ventas presenciales', async ({ page }) => {
    await page.goto('/admin/ventas')
    await expect(page).not.toHaveTitle(/error/i)
    await expect(page.getByRole('heading', { name: /ventas presenciales/i })).toBeVisible({ timeout: 8_000 })
  })

  test('lista de compras', async ({ page }) => {
    await page.goto('/admin/compras')
    await expect(page).not.toHaveTitle(/error/i)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8_000 })
  })

  test('lista de categorías', async ({ page }) => {
    await page.goto('/admin/categorias')
    await expect(page).not.toHaveTitle(/error/i)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8_000 })
  })
})
