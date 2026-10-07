import { type Page, expect, test } from "@playwright/test";

const RECIPIENT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

async function setUpFundedAccount(page: Page) {
  await page.goto("/app");
  // Retry until hydration attaches the click handler.
  await expect(async () => {
    await page.getByRole("button", { name: "Generate new key" }).click({ timeout: 2_000 });
    await expect(page.getByText("Signer address")).toBeVisible({ timeout: 2_000 });
  }).toPass();
  await expect(page.getByTestId("account-address")).toBeVisible();
  await expect(page.getByTestId("deploy-status")).toHaveText("Not deployed");
  await page.getByRole("button", { name: /Fund from Anvil/ }).click();
  await expect(page.getByTestId("account-balance")).toHaveText("10 ETH");
}

async function send(page: Page, amount: string) {
  await page.getByLabel("Recipient").fill(RECIPIENT);
  await page.getByLabel("Amount (ETH)").fill(amount);
  await page.getByRole("button", { name: "Send", exact: true }).click();
}

test("sends ETH and deploys the account on the first user operation", async ({ page }) => {
  await setUpFundedAccount(page);
  await send(page, "0.1");

  await expect(page.getByText("Sent!")).toBeVisible();
  await expect(page.getByTestId("deploy-status")).toHaveText("Deployed");
  await expect(page.getByTestId("activity-status").first()).toHaveText("Success");
  await expect(page.getByTestId("spent-today")).toContainText("0.1 ETH / 1 ETH");
});

test("rejects a send over the daily limit", async ({ page }) => {
  await setUpFundedAccount(page);
  await send(page, "1.5");

  await expect(page.locator("#send-title").locator("..").locator("..").getByRole("alert")).toHaveText(
    "Daily limit reached",
  );
  await expect(page.getByTestId("activity-status").first()).toHaveText("Failed");
});
