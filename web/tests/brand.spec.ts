import { expect, test } from "@playwright/test";

test("brand test page loads", async ({ page }) => {
  await page.goto("/brand-test");
  await expect(page.getByRole("heading", { level: 1, name: "wrenn" })).toBeVisible();
});

test("tokens and fonts apply", async ({ page }) => {
  await page.goto("/brand-test");
  await page.evaluate(() => document.fonts.ready);

  const body = page.locator("body");
  await expect(body).toHaveCSS("background-color", "rgb(255, 248, 236)");

  const h1 = page.getByRole("heading", { level: 1 });
  const h1Font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h1Font.toLowerCase()).toContain("bubblegum");

  const bodyFont = await body.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(bodyFont.toLowerCase()).toContain("figtree");

  await expect(page.getByTestId("button-primary")).toHaveCSS("background-color", "rgb(2, 48, 71)");
});
