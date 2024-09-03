import { test, expect } from '@playwright/test';

test('네이버 증권에서 삼성전자 시세 가져오기2', async ({ page }) => {
  await page.goto('https://www.naver.com/');
  await expect(page).toHaveTitle(/NAVER/);
  await page.pause();

  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: '증권' }).click();
  const page1 = await page1Promise;
  await expect(page1).toHaveTitle(/네이버페이 증권/);

  await page1.getByPlaceholder('종목명·지수명 입력').click();
  await page1.getByPlaceholder('종목명·지수명 입력').fill('삼성전자');
  await page1.getByRole('link', { name: '삼성전자 코스피' }).click();
  await page1.getByRole('link', { name: '시세' }).click();

  const frameHandle = await page1.getBySelector('#content > div.section.inner_sub > iframe:nth-child(4)');
  const frame = await frameHandle.contentFrame();
});