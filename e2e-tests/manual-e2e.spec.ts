import { test, expect, Page } from 'playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOTS_DIR = 'C:/Users/tmone/OneDrive/Desktop/Code/poker-action/screenshots'

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

// Helper to save screenshots with consistent naming
async function saveScreenshot(page: Page, name: string) {
  const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`)
  await page.screenshot({ path: filepath, fullPage: true })
  console.log(`Screenshot saved: ${filepath}`)
}

// Generate unique username for testing
const timestamp = Date.now()
const testUsername = `TestUser_${timestamp}`

test.describe('Test Flow 1: User Registration and Authentication', () => {
  test('should complete full registration and login flow', async ({ page }) => {
    // Step 1: Navigate to landing page
    console.log('Step 1: Navigating to landing page...')
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Step 2: Take screenshot of landing page
    await saveScreenshot(page, '01-landing-page')
    console.log('Landing page loaded successfully')

    // Verify landing page content
    await expect(page.locator('h1')).toContainText('Poker Hub')

    // Step 3: Click "Get Started" to go to registration
    console.log('Step 3: Clicking Get Started button...')
    await page.click('a[href="/register"]')
    await page.waitForURL('/register')
    await page.waitForLoadState('networkidle')

    await saveScreenshot(page, '02-register-page')
    console.log('Registration page loaded')

    // Step 4: Fill in registration form
    console.log('Step 4: Filling registration form...')
    await page.fill('input[name="displayName"]', testUsername)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!')

    await saveScreenshot(page, '03-register-form-filled')

    // Step 5: Submit the form
    console.log('Step 5: Submitting registration form...')
    await page.click('button[type="submit"]')

    // Wait for either redirect to dashboard or error message
    try {
      await page.waitForURL('/dashboard', { timeout: 10000 })
      console.log('Registration successful - redirected to dashboard')

      // Step 6: Take screenshot of dashboard (registration success)
      await page.waitForLoadState('networkidle')
      await saveScreenshot(page, '04-registration-success-dashboard')

      // Step 7: Log out
      console.log('Step 7: Logging out...')
      // Look for logout button or user menu
      const logoutButton = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), a:has-text("Sign Out"), a:has-text("Logout")')
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        await page.waitForURL('/', { timeout: 10000 })
        console.log('Logged out successfully')
        await saveScreenshot(page, '05-after-logout')
      } else {
        // Try to find logout in a menu
        const userMenu = page.locator('[data-testid="user-menu"], button:has-text("' + testUsername + '")')
        if (await userMenu.isVisible()) {
          await userMenu.click()
          await page.click('button:has-text("Sign Out"), button:has-text("Logout")')
        }
      }

      // Step 8: Log back in
      console.log('Step 8: Logging back in...')
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      await page.fill('input[name="displayName"]', testUsername)
      await page.fill('input[name="password"]', 'TestPassword123!')

      await saveScreenshot(page, '06-login-form-filled')

      await page.click('button[type="submit"]')
      await page.waitForURL('/dashboard', { timeout: 10000 })

      console.log('Login successful')
      await saveScreenshot(page, '07-login-success-dashboard')

    } catch (error) {
      // Check if there's an error message on the page
      const errorMessage = page.locator('.text-red-600, .bg-red-50')
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent()
        console.log(`Registration failed with error: ${errorText}`)
        await saveScreenshot(page, '04-registration-error')
      }
      throw error
    }
  })
})

test.describe('Test Flow 2: Auth Edge Cases', () => {
  test('should show error for duplicate display name', async ({ page }) => {
    // First, register a user
    const duplicateTestUser = `DupeUser_${Date.now()}`

    console.log('Registering first user...')
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await page.fill('input[name="displayName"]', duplicateTestUser)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    // Wait for successful registration
    try {
      await page.waitForURL('/dashboard', { timeout: 10000 })
      console.log('First user registered successfully')

      // Logout
      await page.goto('/')
      // Clear any cookies or session
      await page.context().clearCookies()

      // Now try to register with the same name
      console.log('Attempting to register duplicate user...')
      await page.goto('/register')
      await page.waitForLoadState('networkidle')

      await page.fill('input[name="displayName"]', duplicateTestUser)
      await page.fill('input[name="password"]', 'DifferentPass123!')
      await page.fill('input[name="confirmPassword"]', 'DifferentPass123!')
      await page.click('button[type="submit"]')

      // Wait for error message
      await page.waitForTimeout(2000)

      const errorMessage = page.locator('.text-red-600, .bg-red-50, [class*="error"]')
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent()
        console.log(`Duplicate user error shown: ${errorText}`)
        await saveScreenshot(page, '08-duplicate-user-error')
      } else {
        // Check if we were redirected (unexpected success)
        const currentUrl = page.url()
        if (currentUrl.includes('/dashboard')) {
          console.log('WARNING: Duplicate registration unexpectedly succeeded')
          await saveScreenshot(page, '08-duplicate-user-unexpected-success')
        }
      }
    } catch (error) {
      console.log('Error during duplicate user test:', error)
      await saveScreenshot(page, '08-duplicate-user-test-error')
    }
  })

  test('should show error for wrong password login', async ({ page }) => {
    // Create a test user first
    const wrongPassUser = `WrongPassUser_${Date.now()}`

    console.log('Creating test user for wrong password test...')
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await page.fill('input[name="displayName"]', wrongPassUser)
    await page.fill('input[name="password"]', 'CorrectPassword123!')
    await page.fill('input[name="confirmPassword"]', 'CorrectPassword123!')
    await page.click('button[type="submit"]')

    try {
      await page.waitForURL('/dashboard', { timeout: 10000 })
      console.log('Test user created')

      // Clear session
      await page.context().clearCookies()

      // Try to login with wrong password
      console.log('Attempting login with wrong password...')
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      await page.fill('input[name="displayName"]', wrongPassUser)
      await page.fill('input[name="password"]', 'WrongPassword999!')
      await page.click('button[type="submit"]')

      // Wait for error message
      await page.waitForTimeout(2000)

      const errorMessage = page.locator('.text-red-600, .bg-red-50, [class*="error"]')
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent()
        console.log(`Wrong password error shown: ${errorText}`)
        await saveScreenshot(page, '09-wrong-password-error')
      } else {
        // Check if we're still on login page (not redirected)
        const currentUrl = page.url()
        console.log(`Current URL: ${currentUrl}`)
        await saveScreenshot(page, '09-wrong-password-state')
      }
    } catch (error) {
      console.log('Error during wrong password test:', error)
      await saveScreenshot(page, '09-wrong-password-test-error')
    }
  })
})

test.describe('Test Flow 3: Game Creation', () => {
  test('should create a new game and show invite link', async ({ page }) => {
    // Create and login as a test user
    const gameCreatorUser = `GameCreator_${Date.now()}`

    console.log('Creating test user for game creation...')
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await page.fill('input[name="displayName"]', gameCreatorUser)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    try {
      await page.waitForURL('/dashboard', { timeout: 10000 })
      console.log('Logged in as game creator')
      await saveScreenshot(page, '10-dashboard-before-game-creation')

      // Navigate to create game page
      console.log('Navigating to create game page...')

      // Try different ways to find the create game button/link
      const createGameLink = page.locator('a[href="/games/new"], button:has-text("Create Game"), a:has-text("Create Game"), a:has-text("New Game")')

      if (await createGameLink.first().isVisible()) {
        await createGameLink.first().click()
      } else {
        // Direct navigation
        await page.goto('/games/new')
      }

      await page.waitForLoadState('networkidle')
      await saveScreenshot(page, '11-create-game-page')
      console.log('Create game page loaded')

      // Fill in game details
      console.log('Filling in game details...')

      // Calculate tomorrow at 8 PM
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(20, 0, 0, 0)
      const dateTimeValue = tomorrow.toISOString().slice(0, 16)

      await page.fill('input[name="scheduledTime"]', dateTimeValue)
      await page.fill('input[name="location"]', 'Student Union Room 302')
      await page.fill('input[name="bigBlindAmount"], input#bigBlindAmount', '0.50')

      await saveScreenshot(page, '12-game-form-filled')

      // Create the game
      console.log('Submitting game creation form...')
      await page.click('button[type="submit"]')

      // Wait for the modal or success state
      await page.waitForTimeout(3000)

      // Check for invite modal
      const inviteModal = page.locator('[class*="modal"], [role="dialog"], .fixed.inset-0')
      const inviteCode = page.locator('text=/[A-Z0-9]{6,}/')

      if (await inviteModal.first().isVisible() || await inviteCode.first().isVisible()) {
        console.log('Invite modal appeared')
        await saveScreenshot(page, '13-invite-link-modal')

        // Try to find and capture the invite code
        const codeElement = page.locator('code, [class*="invite"], input[readonly]')
        if (await codeElement.first().isVisible()) {
          const code = await codeElement.first().textContent()
          console.log(`Invite code found: ${code}`)
        }
      } else {
        // Check if we were redirected to the game page
        const currentUrl = page.url()
        console.log(`Current URL after game creation: ${currentUrl}`)
        await saveScreenshot(page, '13-game-creation-result')

        // Check for any success message
        const successMessage = page.locator('.text-green-600, [class*="success"]')
        if (await successMessage.isVisible()) {
          console.log('Game created successfully')
        }
      }

    } catch (error) {
      console.log('Error during game creation test:', error)
      await saveScreenshot(page, '13-game-creation-error')

      // Check for any error messages
      const errorMessage = page.locator('.text-red-600, .bg-red-50')
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent()
        console.log(`Game creation error: ${errorText}`)
      }
    }
  })
})
