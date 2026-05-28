import { type Page } from '@playwright/test'

export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL ?? 'usuario_test@example.com',
  password: process.env.TEST_USER_PASSWORD ?? 'password_test',
}

export const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL ?? 'admin@example.com',
  password: process.env.TEST_ADMIN_PASSWORD ?? 'password_admin',
}

export async function loginAs(page: Page, role: 'user' | 'admin') {
  const creds = role === 'admin' ? TEST_ADMIN : TEST_USER
  await page.goto('/login')
  await page.getByLabel('Email').fill(creds.email)
  await page.getByLabel('Contraseña').fill(creds.password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 10_000 })
}

export async function logout(page: Page) {
  // Limpiar cookies de sesión y localStorage es la forma más confiable
  await page.context().clearCookies()
  await page.evaluate(() => localStorage.clear())
}
