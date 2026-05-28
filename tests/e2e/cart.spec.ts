import { test, expect } from '@playwright/test'

async function addFirstProductToCart(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  await page.goto('/productos')
  await page.locator('a[href^="/productos/"]').first().click()
  await page.waitForURL(/\/productos\/.+/)
  await page.getByRole('button', { name: /agregar al carrito/i }).click()
  // Esperar a que Zustand persista en localStorage antes de navegar
  await page.waitForTimeout(800)
}

test.describe('Carrito de compras', () => {
  test('agregar producto al carrito actualiza el badge', async ({ page }) => {
    await page.goto('/productos')
    await page.locator('a[href^="/productos/"]').first().click()
    await page.waitForURL(/\/productos\/.+/)

    await page.getByRole('button', { name: /agregar al carrito/i }).click()

    // El carrito en la Navbar debe mostrar un número > 0 (hay 2 links /cart: navbar + bottom nav)
    await expect(page.locator('a[href="/cart"]').first()).toContainText('1', { timeout: 5_000 })
  })

  test('ver carrito con items', async ({ page }) => {
    await addFirstProductToCart(page)

    await page.goto('/cart')
    // Esperar a que el componente monte (tiene un useState(false) para evitar hydration mismatch)
    await page.waitForFunction(
      () => !document.body.innerText.includes('Cargando carrito'),
      { timeout: 5_000 }
    )
    await expect(page.getByRole('heading', { name: /tu carrito/i })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Total', { exact: true })).toBeVisible()
  })

  test('carrito vacío muestra mensaje', async ({ page }) => {
    await page.goto('/cart')
    await page.waitForFunction(
      () => !document.body.innerText.includes('Cargando carrito'),
      { timeout: 5_000 }
    )
    await expect(page.getByText(/tu carrito está vacío/i)).toBeVisible({ timeout: 5_000 })
  })

  test('eliminar producto del carrito', async ({ page }) => {
    await addFirstProductToCart(page)

    await page.goto('/cart')
    await page.waitForFunction(
      () => !document.body.innerText.includes('Cargando carrito'),
      { timeout: 5_000 }
    )
    await page.waitForSelector('text=Total', { timeout: 5_000 })

    // El botón de eliminar tiene clase text-destructive (color rojo)
    await page.locator('button.text-destructive').first().click()
    await expect(page.getByText(/tu carrito está vacío/i)).toBeVisible({ timeout: 5_000 })
  })
})
