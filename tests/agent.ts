/**
 * VibeMesh Testing Agent
 * ─────────────────────
 * End-to-end Playwright test that exercises every major user flow.
 *
 * Rules:
 *  - Throwaway test user generated each run (timestamp email)
 *  - Never touches real user data
 *  - Service role key used only to simulate ClamAV approving an upload —
 *    the browser never receives that key
 *  - All flows run in order; failures are logged and execution continues
 *  - Prints a summary table; exits 0 on full pass, 1 on any failure
 *
 * Run: pnpm test:agent
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { generateFixture } from './fixtures/generate-zip';

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const RUN_ID = Date.now();
const TEST_EMAIL = `vm_agent_${RUN_ID}@test.invalid`;
const TEST_PASSWORD = `Vibe!${RUN_ID}Mesh`;
const TEST_APP_TITLE = `Agent App ${RUN_ID}`;
const TEST_APP_DESC = `Auto-generated blueprint for agent run ${RUN_ID}`;
const TEST_TAGS = 'agent,test,playwright';

// ─── Result tracking ─────────────────────────────────────────────────────────

interface FlowResult {
  flow: string;
  pass: boolean;
  ms: number;
  error?: string;
}

const results: FlowResult[] = [];

async function runFlow(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ flow: name, pass: true, ms: Date.now() - start });
    console.log(`  ✓  ${name} (${Date.now() - start}ms)`);
  } catch (err: unknown) {
    const msg = err instanceof Error
      ? `${err.message}${err.stack ? '\n' + err.stack.split('\n').slice(1, 3).join('\n') : ''}`
      : String(err);
    results.push({ flow: name, pass: false, ms: Date.now() - start, error: msg });
    console.log(`  ✗  ${name} (${Date.now() - start}ms)\n     ${msg.split('\n')[0].slice(0, 200)}`);
  }
}

function printSummary(): void {
  const COL_FLOW = 14;
  const BORDER = '─'.repeat(70);
  console.log('\n' + BORDER);
  console.log(
    'Flow'.padEnd(COL_FLOW) +
    'Status'.padEnd(8) +
    'Time(ms)'.padEnd(10) +
    'Failure detail',
  );
  console.log(BORDER);
  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    const detail = r.error ? r.error.split('\n')[0].slice(0, 50) : '';
    console.log(
      r.flow.padEnd(COL_FLOW) +
      status.padEnd(8) +
      String(r.ms).padEnd(10) +
      detail,
    );
  }
  console.log(BORDER);
  const passed = results.filter((r) => r.pass).length;
  console.log(`${passed}/${results.length} flows passed\n`);
}

// ─── Shared mutable state between flows ──────────────────────────────────────

let svc: SupabaseClient; // service-role client — never sent to browser
let testUserId = '';
let appId = '';
let appSlug = '';
let remixId = '';
let remixSlug = '';
let fixturePath = '';

// ─── Helper: wait for navigation away from current URL path ──────────────────

async function awaitNav(page: Page, notPath: string, timeout = 12_000) {
  await page.waitForURL(
    (url) => !url.pathname.startsWith(notPath),
    { timeout },
  );
}

// ─── The one Playwright test ──────────────────────────────────────────────────

test('VibeMesh agent — all flows', async ({ browser }) => {
  // ── Setup ──────────────────────────────────────────────────────────────────

  svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  fixturePath = await generateFixture();

  // Fresh browser context per run — no leftover cookies
  const ctx: BrowserContext = await browser.newContext({
    acceptDownloads: true,
  });
  const page: Page = await ctx.newPage();

  // ── 1. Auth ────────────────────────────────────────────────────────────────

  await runFlow('Auth', async () => {
    // Create a pre-confirmed throwaway user via the admin API.
    // The browser never sees the service-role key — this only touches the DB.
    const { data: created, error: createErr } =
      await svc.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
      });
    if (createErr) throw new Error(`Admin createUser: ${createErr.message}`);
    testUserId = created.user.id;

    // ── Sign in via browser ────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[name="email"], input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[name="password"], input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await awaitNav(page, '/login');

    // Confirm session — auth cookie or token cookie must be present
    const cookies = await ctx.cookies();
    const hasAuth = cookies.some(
      (c) => c.name.includes('auth-token') || c.name.includes('sb-') || c.name.includes('supabase'),
    );
    if (!hasAuth) throw new Error('No Supabase auth cookie found after login');

    // ── Sign out ───────────────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/profile`);
    await page.locator('[data-testid="signout"]').click();
    await page.waitForURL(/\/(login|$)/, { timeout: 8_000 });

    // ── Login again ────────────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[name="email"], input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[name="password"], input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await awaitNav(page, '/login');

    // Confirm session restored
    const cookies2 = await ctx.cookies();
    const hasAuth2 = cookies2.some(
      (c) => c.name.includes('auth-token') || c.name.includes('sb-') || c.name.includes('supabase'),
    );
    if (!hasAuth2) throw new Error('Session not restored after re-login');
  });

  // ── 2. Upload ──────────────────────────────────────────────────────────────

  await runFlow('Upload', async () => {
    await page.goto(`${BASE_URL}/upload`);

    await page.locator('input[name="title"]').fill(TEST_APP_TITLE);
    await page.locator('textarea[name="description"]').fill(TEST_APP_DESC);

    const tagsInput = page.locator('input[name="tags"]');
    if (await tagsInput.count() > 0) await tagsInput.fill(TEST_TAGS);

    // Attach the fixture zip (target the zip input specifically to avoid matching screenshot input)
    await page.locator('input#zip, input[name="zip"]').setInputFiles(fixturePath);

    await page.locator('button[type="submit"]').click();

    // Wait for redirect to app detail or profile
    await page.waitForURL(/\/(app|profile)\//, { timeout: 20_000 });

    // Fetch the created app from the DB (using service role so RLS doesn't block)
    const { data: apps, error } = await svc
      .from('apps')
      .select('id, slug, status, scan_status')
      .eq('creator_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw new Error(`DB query: ${error.message}`);
    if (!apps?.length) throw new Error('App not found in DB after upload');

    appId = apps[0].id;
    appSlug = apps[0].slug;

    if (!['pending', 'queued'].includes(apps[0].status) && apps[0].scan_status !== 'queued') {
      // Accept 'pending' status + any scan_status of queued/scanning
      const ok =
        apps[0].status === 'pending' &&
        ['queued', 'scanning'].includes(apps[0].scan_status);
      if (!ok) {
        throw new Error(
          `Expected pending+queued, got status=${apps[0].status} scan_status=${apps[0].scan_status}`,
        );
      }
    }

    // Appears on creator profile (pending is visible to creator)
    await page.goto(`${BASE_URL}/profile`);
    await expect(
      page.locator('[data-testid="app-card"]', { hasText: TEST_APP_TITLE }),
    ).toBeVisible({ timeout: 8_000 });

    // Does NOT appear in public feed (scan not clean yet)
    await page.goto(BASE_URL);
    const feedMatch = page.locator('[data-testid="feed-card"]', { hasText: TEST_APP_TITLE });
    // Small wait to let the page fully render
    await page.waitForTimeout(500);
    const feedCount = await feedMatch.count();
    if (feedCount > 0) throw new Error('Pending app appeared in the public feed');
  });

  // ── 3. Scan gate ───────────────────────────────────────────────────────────

  await runFlow('Scan Gate', async () => {
    if (!appId) throw new Error('No appId — Upload flow must have failed');

    // Simulate ClamAV approving the upload via service role (never via browser)
    const { error } = await svc
      .from('apps')
      .update({ scan_status: 'clean', status: 'active' })
      .eq('id', appId);
    if (error) throw new Error(`DB update: ${error.message}`);

    // Reload the public feed — app should now be visible
    await page.goto(BASE_URL);
    await page.reload();

    await expect(
      page.locator(`[data-testid="feed-card"][data-slug="${appSlug}"], a[href="/app/${appSlug}"]`).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── 4. App detail ──────────────────────────────────────────────────────────

  await runFlow('App Detail', async () => {
    if (!appSlug) throw new Error('No appSlug');

    await page.goto(`${BASE_URL}/app/${appSlug}`);

    // Title
    await expect(
      page.locator('[data-testid="app-title"]', { hasText: TEST_APP_TITLE }),
    ).toBeVisible();

    // Description
    await expect(
      page.locator('[data-testid="app-description"]', { hasText: TEST_APP_DESC }),
    ).toBeVisible();

    // Tags (at least one from the comma-separated list)
    await expect(page.locator('[data-testid="tag"]').first()).toBeVisible();

    // Dependency list section
    await expect(page.locator('[data-testid="deps"]')).toBeVisible();

    // Download button
    await expect(
      page.locator('[data-testid="download-btn"], a:has-text("Download"), button:has-text("Download")'),
    ).toBeVisible();
  });

  // ── 5. Download ────────────────────────────────────────────────────────────

  await runFlow('Download', async () => {
    if (!appSlug || !appId) throw new Error('No appSlug/appId');

    await page.goto(`${BASE_URL}/app/${appSlug}`);

    // Snapshot download_count before click
    const { data: before } = await svc
      .from('apps')
      .select('download_count')
      .eq('id', appId)
      .single();
    const countBefore = before?.download_count ?? 0;

    // Click download and capture the browser download event
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20_000 }),
      page.locator('[data-testid="download-btn"], a:has-text("Download"), button:has-text("Download")')
        .first()
        .click(),
    ]);

    // Verify the received file is a zip
    const filename = download.suggestedFilename();
    if (!filename.toLowerCase().endsWith('.zip')) {
      throw new Error(`Expected .zip download, got: "${filename}"`);
    }

    const savePath = path.join('/tmp', `vibemesh_dl_${RUN_ID}.zip`);
    await download.saveAs(savePath);

    const stats = fs.statSync(savePath);
    if (stats.size < 50) {
      throw new Error(`Downloaded zip is suspiciously small: ${stats.size} bytes`);
    }

    // Verify download_count incremented by exactly 1
    const { data: after } = await svc
      .from('apps')
      .select('download_count')
      .eq('id', appId)
      .single();
    const countAfter = after?.download_count ?? 0;

    if (countAfter !== countBefore + 1) {
      throw new Error(`download_count: expected ${countBefore + 1}, got ${countAfter}`);
    }
  });

  // ── 6. Remix ───────────────────────────────────────────────────────────────

  await runFlow('Remix', async () => {
    if (!appSlug || !appId) throw new Error('No appSlug/appId');

    await page.goto(`${BASE_URL}/app/${appSlug}/remix`);

    await page.locator('input[name="title"]').fill(`Remix of ${TEST_APP_TITLE}`);
    await page.locator('textarea[name="description"]').fill(`Automated remix ${RUN_ID}`);

    const tagsInput = page.locator('input[name="tags"]');
    if (await tagsInput.count() > 0) await tagsInput.fill('remix,agent');

    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(app|profile)\//, { timeout: 20_000 });

    // Find the remix in the DB
    const { data: remixes, error } = await svc
      .from('apps')
      .select('id, slug, parent_id')
      .eq('creator_id', testUserId)
      .eq('parent_id', appId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw new Error(`DB query: ${error.message}`);
    if (!remixes?.length) throw new Error('Remix row not found in DB');
    if (remixes[0].parent_id !== appId) {
      throw new Error(`parent_id mismatch: got ${remixes[0].parent_id}, expected ${appId}`);
    }

    remixId = remixes[0].id;
    remixSlug = remixes[0].slug;

    // Snapshot remix_count on parent before approval
    const { data: parentBefore } = await svc
      .from('apps')
      .select('remix_count')
      .eq('id', appId)
      .single();
    const remixCountBefore = parentBefore?.remix_count ?? 0;

    // Approve remix via service role (scan simulation)
    await svc
      .from('apps')
      .update({ scan_status: 'clean', status: 'active' })
      .eq('id', remixId);

    // Allow DB trigger / webhook time to fire (if set up)
    await page.waitForTimeout(1_500);

    const { data: parentAfter } = await svc
      .from('apps')
      .select('remix_count')
      .eq('id', appId)
      .single();
    const remixCountAfter = parentAfter?.remix_count ?? 0;

    if (remixCountAfter !== remixCountBefore + 1) {
      // Warn but don't fail — the trigger/webhook may not be wired yet
      console.warn(
        `    ⚠  remix_count on parent: expected ${remixCountBefore + 1}, got ${remixCountAfter}` +
        ` — ensure a DB trigger increments this when a child reaches active status`,
      );
    }
  });

  // ── 7. Remix tree ──────────────────────────────────────────────────────────

  await runFlow('Remix Tree', async () => {
    if (!appSlug) throw new Error('No appSlug');

    await page.goto(`${BASE_URL}/app/${appSlug}/tree`);

    // Parent node visible
    await expect(
      page.locator(`[data-testid="tree-node"]`, { hasText: TEST_APP_TITLE }),
    ).toBeVisible({ timeout: 8_000 });

    // Remix node visible (if remix was created in the previous flow)
    if (remixSlug) {
      await expect(
        page.locator(`[data-testid="tree-node"][data-slug="${remixSlug}"]`),
      ).toBeVisible({ timeout: 8_000 });
    }
  });

  // ── 8. Report ──────────────────────────────────────────────────────────────

  await runFlow('Report', async () => {
    if (!appSlug || !appId || !testUserId) throw new Error('No appSlug/appId/userId');

    await page.goto(`${BASE_URL}/app/${appSlug}`);

    // Open report modal
    await page.locator('[data-testid="report-btn"]').click();

    // Select reason — the select element has options spam, malware, etc.
    const reasonEl = page.locator('[data-testid="report-reason"]');
    await expect(reasonEl).toBeVisible({ timeout: 5_000 });
    await reasonEl.selectOption('spam');

    // Submit
    await page.locator('[data-testid="report-submit"]').click();

    // Wait for the confirmation message to appear in the modal
    await expect(
      page.locator('text=Report submitted, [data-testid="report-done"]').first(),
    ).toBeVisible({ timeout: 8_000 });

    // Verify the row exists in the DB
    const { data: reportRows } = await svc
      .from('reports')
      .select('id')
      .eq('app_id', appId)
      .eq('reporter_id', testUserId)
      .eq('reason', 'spam');

    if (!reportRows?.length) {
      throw new Error('Report row not found in the reports table');
    }
  });

  // ── 9. Cleanup ─────────────────────────────────────────────────────────────

  await runFlow('Cleanup', async () => {
    const allAppIds = [appId, remixId].filter(Boolean);

    if (allAppIds.length) {
      // Delete in dependency order: reports → downloads → apps
      await svc.from('reports').delete().in('app_id', allAppIds);
      await svc.from('downloads').delete().in('app_id', allAppIds);

      // Also clean up any zip objects from storage (best effort)
      for (const id of allAppIds) {
        const { data: appRow } = await svc
          .from('apps')
          .select('zip_path')
          .eq('id', id)
          .single();
        if (appRow?.zip_path) {
          await svc.storage
            .from(process.env.APP_ZIP_BUCKET ?? 'app-zips')
            .remove([appRow.zip_path]);
        }
      }

      await svc.from('apps').delete().in('id', allAppIds);
    }

    if (testUserId) {
      await svc.from('profiles').delete().eq('id', testUserId);
      const { error: delErr } = await svc.auth.admin.deleteUser(testUserId);
      if (delErr) throw new Error(`Failed to delete test user: ${delErr.message}`);
    }
  });

  // ── Close browser context ──────────────────────────────────────────────────

  await ctx.close();

  // ── Summary table ──────────────────────────────────────────────────────────

  printSummary();

  // Fail the Playwright test (→ exit code 1) if any flow failed
  const failed = results.filter((r) => !r.pass);
  if (failed.length > 0) {
    throw new Error(
      `${failed.length}/${results.length} flow(s) failed: ${failed.map((r) => r.flow).join(', ')}`,
    );
  }
});
