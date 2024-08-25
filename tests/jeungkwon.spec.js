const { test, expect } = require('@playwright/test');

test('네이버 증권으로 가기', async ({ page }) => {
    await page.goto('https://www.naver.com/');
    await expect(page).toHaveTitle(/NAVER/);
    await page.pause();

    // 현재 컨텍스트에서 새로운 페이지 이벤트 대기
    const newPagePromise = page.context().waitForEvent('page');
    
    // 증권 페이지로 이동하는 링크 클릭
    await page.locator('#shortcutArea > ul > li:nth-child(6) > a > span.service_name').click();
    
    // 새로운 페이지 객체 얻기
    const newPage = await newPagePromise;
    
    console.log('새로운탭 url:', newPage.url());
    await expect(newPage).toHaveTitle(/네이버페이 증권/);


    await newPage.locator('#stock_items').click();
    await newPage.locator('#stock_items').fill('삼성전자');
    await newPage.locator('#atcmp > div.wrap_in > div > ul > li:nth-child(1) > a').click();

    try {
    console.log('새로운탭 url:', newPage.url());
    await expect(newPage).toHaveTitle(/삼성전자 : 네이버페이 증권/);

    await newPage.locator('.tab2').click({ force: true });
    await newPage.waitForSelector('table.type2', { state: 'visible', timeout: 10000 });

    const prices = await newPage.evaluate(() => {
        const rows = document.querySelectorAll('table.type2 tbody tr');
        return Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) {
                const date = cells[0].textContent.trim();
                const closePrice = cells[1].textContent.trim();
                // 날짜 형식 검증 (YYYY.MM.DD)
                if (/^\d{4}\.\d{2}\.\d{2}$/.test(date)) {
                    return { date, closePrice };
                }
            }
            return null;
        }).filter(item => item !== null);
    });

    console.log('일별 시세:', prices);
    console.log('추출된 행 수:', prices.length);

} catch (error) {
    console.error('에러 발생:', error);
}

// 디버깅을 위해 잠시 대기
await newPage.waitForTimeout(5000);
});

