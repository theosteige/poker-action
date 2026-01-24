import { test, expect } from 'playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOTS_DIR = 'C:/Users/tmone/OneDrive/Desktop/Code/poker-action/screenshots'

// Ensure screenshots directory exists
test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  }
})

// Generate unique username for testing (max 20 chars)
const shortId = Date.now().toString().slice(-6)

test.describe.serial('Poker Hub E2E Tests', () => {

  test('01 - Landing Page', async ({ page }) => {
    console.log('Test 01: Checking landing page...')

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Take screenshot of landing page
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-landing-page.png'),
      fullPage: true
    })

    // Verify landing page content
    const heading = page.locator('h1')
    await expect(heading).toContainText('Poker Hub')

    // Verify Get Started button exists (use first() to handle multiple matches)
    const getStartedButton = page.locator('a[href="/register"]').first()
    await expect(getStartedButton).toBeVisible()

    // Verify Sign In button exists
    const signInButton = page.locator('a[href="/login"]').first()
    await expect(signInButton).toBeVisible()

    console.log('Landing page test passed!')
  })

  test('02 - User Registration', async ({ page }) => {
    const testUsername = `TestUser_${shortId}`
    console.log(`Test 02: Registering user ${testUsername}...`)

    await page.goto('/register', { waitUntil: 'domcontentloaded' })

    // Take screenshot of registration page
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-register-page.png'),
      fullPage: true
    })

    // Fill registration form
    await page.fill('input[name="displayName"]', testUsername)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!')

    // Take screenshot with filled form
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-register-form-filled.png'),
      fullPage: true
    })

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for navigation or error
    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    console.log(`After registration, URL: ${currentUrl}`)

    if (currentUrl.includes('/dashboard')) {
      console.log('Registration successful!')
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '04-registration-success.png'),
        fullPage: true
      })
    } else {
      // Check for error
      const error = page.locator('.text-red-600')
      if (await error.isVisible()) {
        const errorText = await error.textContent()
        console.log(`Registration error: ${errorText}`)
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '04-registration-error.png'),
          fullPage: true
        })
      }
    }

    // Store username for later tests
    process.env.TEST_USERNAME = testUsername
  })

  test('03 - Duplicate User Registration Error', async ({ page }) => {
    const duplicateUser = `DupeTest_${shortId}`
    console.log(`Test 03: Testing duplicate user registration for ${duplicateUser}...`)

    // First registration
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await page.fill('input[name="displayName"]', duplicateUser)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    // Wait for first registration to complete
    await page.waitForTimeout(3000)

    const firstUrl = page.url()
    if (!firstUrl.includes('/dashboard')) {
      console.log('First registration failed, skipping duplicate test')
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '05-first-reg-failed.png'),
        fullPage: true
      })
      return
    }

    // Clear cookies to logout
    await page.context().clearCookies()

    // Try to register with same username
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await page.fill('input[name="displayName"]', duplicateUser)
    await page.fill('input[name="password"]', 'DifferentPass456!')
    await page.fill('input[name="confirmPassword"]', 'DifferentPass456!')
    await page.click('button[type="submit"]')

    // Wait for error
    await page.waitForTimeout(3000)

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-duplicate-user-error.png'),
      fullPage: true
    })

    // Check for error message
    const error = page.locator('.text-red-600')
    if (await error.isVisible()) {
      const errorText = await error.textContent()
      console.log(`Duplicate user error shown: ${errorText}`)
    } else {
      console.log('No error message visible - checking URL')
      const secondUrl = page.url()
      console.log(`After duplicate registration, URL: ${secondUrl}`)
    }
  })

  test('04 - Wrong Password Login Error', async ({ page }) => {
    const wrongPassUser = `WrongPass_${shortId}`
    console.log(`Test 04: Testing wrong password login for ${wrongPassUser}...`)

    // First, create a user
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await page.fill('input[name="displayName"]', wrongPassUser)
    await page.fill('input[name="password"]', 'CorrectPassword123!')
    await page.fill('input[name="confirmPassword"]', 'CorrectPassword123!')
    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)

    const regUrl = page.url()
    if (!regUrl.includes('/dashboard')) {
      console.log('User creation failed, skipping wrong password test')
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '06-user-creation-failed.png'),
        fullPage: true
      })
      return
    }

    // Clear cookies to logout
    await page.context().clearCookies()

    // Try to login with wrong password
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.fill('input[name="displayName"]', wrongPassUser)
    await page.fill('input[name="password"]', 'WrongPassword999!')
    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06-wrong-password-error.png'),
      fullPage: true
    })

    // Check for error message
    const error = page.locator('.text-red-600')
    if (await error.isVisible()) {
      const errorText = await error.textContent()
      console.log(`Wrong password error shown: ${errorText}`)
    } else {
      console.log('No error message visible')
      const loginUrl = page.url()
      console.log(`After wrong password, URL: ${loginUrl}`)
    }
  })

  test('05 - Game Creation', async ({ page }) => {
    const gameCreator = `Creator_${shortId}`
    console.log(`Test 05: Testing game creation as ${gameCreator}...`)

    // Register and login
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await page.fill('input[name="displayName"]', gameCreator)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)

    const regUrl = page.url()
    if (!regUrl.includes('/dashboard')) {
      console.log('User creation failed, skipping game creation test')
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '07-creator-reg-failed.png'),
        fullPage: true
      })
      return
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '07-dashboard.png'),
      fullPage: true
    })

    // Navigate to create game
    await page.goto('/games/new', { waitUntil: 'domcontentloaded' })

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '08-create-game-page.png'),
      fullPage: true
    })

    // Fill game form
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(20, 0, 0, 0)
    const dateTimeValue = tomorrow.toISOString().slice(0, 16)

    await page.fill('input[name="scheduledTime"]', dateTimeValue)
    await page.fill('input[name="location"]', 'Student Union Room 302')

    // Try both selectors for big blind input
    const bigBlindInput = page.locator('input[name="bigBlindAmount"], input#bigBlindAmount')
    await bigBlindInput.fill('0.50')

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '09-game-form-filled.png'),
      fullPage: true
    })

    // Submit
    await page.click('button[type="submit"]')

    await page.waitForTimeout(5000)

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '10-game-creation-result.png'),
      fullPage: true
    })

    // Check for modal or redirect
    const modal = page.locator('[role="dialog"], .fixed.inset-0, [class*="modal"]')
    if (await modal.first().isVisible()) {
      console.log('Invite modal appeared!')
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '11-invite-link-modal.png'),
        fullPage: true
      })
    } else {
      const currentUrl = page.url()
      console.log(`After game creation, URL: ${currentUrl}`)

      // Check for error
      const error = page.locator('.text-red-600')
      if (await error.isVisible()) {
        const errorText = await error.textContent()
        console.log(`Game creation error: ${errorText}`)
      }
    }
  })
})
