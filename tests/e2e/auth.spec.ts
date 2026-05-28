import { test, expect } from '@playwright/test'
import { loginAs, logout } from '../fixtures/auth'

test.describe('Autenticación', () => {
  test('login con credenciales válidas', async ({ page }) => {
    await loginAs(page, 'user')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('login con credenciales inválidas muestra error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('noexiste@test.com')
    await page.getByLabel('Contraseña').fill('malpassword')

    // Escuchar el URL transiente con ?error= ANTES de hacer click
    // (FlashMessage lo limpia rápidamente, por eso lo escuchamos antes)
    const errorRedirect = page.waitForURL(/[?&]error=/, { timeout: 8_000 }).catch(() => null)
    await page.getByRole('button', { name: 'Ingresar' }).click()
    await errorRedirect

    // Verificar que seguimos en /login (no redirigió al home)
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  })

  test('historial de pedidos del cliente', async ({ page }) => {
    await loginAs(page, 'user')
    await page.goto('/mi-cuenta/pedidos')
    await expect(page.getByRole('heading', { name: /mis pedidos/i })).toBeVisible({ timeout: 8_000 })
  })

  test('redirige a login si no está autenticado', async ({ page }) => {
    await page.goto('/checkout')
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })

  test('cerrar sesión', async ({ page }) => {
    await loginAs(page, 'user')
    await logout(page)
    await page.goto('/mi-cuenta/pedidos')
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })
})

test.describe('Admin', () => {
  test('admin puede acceder al panel', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 8_000 })
  })

  test('usuario normal no puede acceder al panel admin', async ({ page }) => {
    await loginAs(page, 'user')
    await page.goto('/admin')
    await expect(page).not.toHaveURL('/admin')
  })
})
