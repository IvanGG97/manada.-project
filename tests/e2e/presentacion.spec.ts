/**
 * Script para grabar el video de presentación.
 * Ejecutar con:
 *   npm run test:video
 */
import { test } from '@playwright/test'
import { logout } from '../fixtures/auth'

const PAUSA = 1800
const PAUSA_CORTA = 900

const USER = {
  email: process.env.TEST_USER_EMAIL ?? '',
  password: process.env.TEST_USER_PASSWORD ?? '',
}
const ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL ?? '',
  password: process.env.TEST_ADMIN_PASSWORD ?? '',
}

async function doLogin(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never, email: string, password: string) {
  await page.goto('/login')
  await page.waitForSelector('input[name="email"]', { timeout: 15_000 })
  await page.fill('input[name="email"]', email)
  await page.waitForTimeout(400)
  await page.fill('input[name="password"]', password)
  await page.waitForTimeout(400)
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 })
}

test('video presentación — flujo completo', async ({ page }) => {
  test.setTimeout(240_000) // 4 minutos

  // ═══════════════════════════════════════════════════════
  // HOME
  // ═══════════════════════════════════════════════════════
  await page.goto('/')
  await page.waitForTimeout(PAUSA * 2)

  // ═══════════════════════════════════════════════════════
  // CATÁLOGO — explorar productos
  // ═══════════════════════════════════════════════════════
  await page.goto('/productos')
  await page.waitForTimeout(PAUSA)

  const searchInput = page.getByPlaceholder(/buscar/i)
  if (await searchInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await searchInput.fill('remera')
    await page.waitForTimeout(PAUSA)
    await searchInput.press('Escape')
    await searchInput.fill('')
    await page.waitForTimeout(PAUSA_CORTA)
  }

  // ═══════════════════════════════════════════════════════
  // DETALLE DE PRODUCTO
  // ═══════════════════════════════════════════════════════
  await page.locator('a[href^="/productos/"]').first().click()
  await page.waitForTimeout(PAUSA)

  const addBtn = page.getByRole('button', { name: /agregar al carrito/i })
  if (await addBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await addBtn.click()
    await page.waitForTimeout(PAUSA)
  }

  // ═══════════════════════════════════════════════════════
  // CARRITO
  // ═══════════════════════════════════════════════════════
  await page.goto('/cart')
  await page.waitForTimeout(PAUSA * 2)

  // ═══════════════════════════════════════════════════════
  // LOGIN como usuario
  // ═══════════════════════════════════════════════════════
  await doLogin(page, USER.email, USER.password)
  await page.waitForTimeout(PAUSA)

  // ═══════════════════════════════════════════════════════
  // MI CUENTA / PEDIDOS
  // ═══════════════════════════════════════════════════════
  await page.goto('/mi-cuenta/pedidos')
  await page.waitForTimeout(PAUSA * 2)

  // ═══════════════════════════════════════════════════════
  // CERRAR SESIÓN y LOGIN como admin
  // ═══════════════════════════════════════════════════════
  await logout(page)
  await page.waitForTimeout(PAUSA_CORTA)
  await doLogin(page, ADMIN.email, ADMIN.password)
  await page.waitForTimeout(PAUSA)

  // ═══════════════════════════════════════════════════════
  // ADMIN: DASHBOARD
  // ═══════════════════════════════════════════════════════
  await page.goto('/admin')
  await page.waitForTimeout(PAUSA * 2)

  // ═══════════════════════════════════════════════════════
  // ADMIN: PRODUCTOS
  // ═══════════════════════════════════════════════════════
  await page.goto('/admin/productos')
  await page.waitForTimeout(PAUSA * 2)

  // ═══════════════════════════════════════════════════════
  // ADMIN: ÓRDENES
  // ═══════════════════════════════════════════════════════
  await page.goto('/admin/ordenes')
  await page.waitForTimeout(PAUSA * 2)

  // ═══════════════════════════════════════════════════════
  // ADMIN: VENTAS
  // ═══════════════════════════════════════════════════════
  await page.goto('/admin/ventas')
  await page.waitForTimeout(PAUSA * 2)

  // ═══════════════════════════════════════════════════════
  // VER TIENDA COMO ADMIN (catálogo)
  // ═══════════════════════════════════════════════════════
  await page.goto('/productos')
  await page.waitForTimeout(PAUSA * 2)
})
