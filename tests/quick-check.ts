import { test, expect } from '@playwright/test';

test.describe('Quick Website Smoke Test', () => {
  test('Feed page - images and cards', async ({ page }) => {
    await page.goto('http://localhost:3000');

    console.log('\n📊 FEED PAGE CHECK');
    console.log('─'.repeat(50));

    // Check apps load
    const cards = page.locator('[data-testid="feed-card"]');
    const count = await cards.count();
    console.log(`✅ Found ${count} app cards`);

    if (count > 0) {
      const title = await cards.first().locator('h2').textContent();
      console.log(`✅ First app: "${title}"`);

      // Check image
      const img = cards.first().locator('img').first();
      const visible = await img.isVisible().catch(() => false);
      console.log(visible ? '✅ Image loads' : '❌ Image broken');

      // Check description
      const desc = cards.first().locator('p').first();
      const descVisible = await desc.isVisible().catch(() => false);
      console.log(descVisible ? '✅ Description shows' : '⚠️  No description');
    }
  });

  test('App detail page', async ({ page }) => {
    await page.goto('http://localhost:3000');

    console.log('\n📊 APP DETAIL PAGE CHECK');
    console.log('─'.repeat(50));

    // Find first app
    const firstCard = page.locator('[data-testid="feed-card"]').first();
    const slug = await firstCard.getAttribute('data-slug');

    if (slug) {
      await page.goto(`http://localhost:3000/app/${slug}`);

      // Check page loaded
      const title = page.locator('[data-testid="app-title"]');
      const titleText = await title.textContent().catch(() => null);
      console.log(titleText ? `✅ App page loaded: "${titleText}"` : '❌ No title');

      // Check download button
      const dlBtn = page.locator('button:has-text("Download"), a:has-text("Download")').first();
      const dlVisible = await dlBtn.isVisible().catch(() => false);
      console.log(dlVisible ? '✅ Download button visible' : '❌ Download button missing');

      // Check screenshot/carousel
      const carousel = page.locator('[role="img"]').first();
      const carouselVisible = await carousel.isVisible().catch(() => false);
      console.log(carouselVisible ? '✅ Screenshot carousel visible' : '⚠️  No carousel');

      // Check packages section
      const packages = page.locator('[data-testid="deps"]');
      const pkgVisible = await packages.isVisible().catch(() => false);
      console.log(pkgVisible ? '✅ Packages section visible' : '⚠️  No packages');
    }
  });

  test('Button interactions', async ({ page }) => {
    await page.goto('http://localhost:3000');

    console.log('\n📊 BUTTON & INTERACTION CHECK');
    console.log('─'.repeat(50));

    // Test sort buttons
    const sortBtn = page.locator('button:has-text("Trending")').first();
    const sortVisible = await sortBtn.isVisible().catch(() => false);
    console.log(sortVisible ? '✅ Sort buttons visible' : '❌ Sort buttons missing');

    if (sortVisible) {
      await sortBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ Sort button clickable');
    }

    // Test tag filters
    const tagBtn = page.locator('button:has-text("react")').first();
    const tagVisible = await tagBtn.isVisible().catch(() => false);
    console.log(tagVisible ? '✅ Tag filters visible' : '⚠️  No tag filters');
  });

  test('Summary', async () => {
    console.log('\n' + '='.repeat(50));
    console.log('📋 TEST COMPLETE');
    console.log('='.repeat(50));
    console.log('Check above for ✅, ❌, and ⚠️ indicators\n');
  });
});
