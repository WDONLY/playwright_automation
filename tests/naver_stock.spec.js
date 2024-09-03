const { test, expect } = require('@playwright/test');

test('네이버 증권에서 삼성전자 시세 가져오기', async ({ page }) => {
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

    await newPage.waitForSelector('#content > div.section.inner_sub > iframe:nth-child(4)', { state: 'attached' });

    // iframe 내용 가져오기
    const frameHandle = await newPage.$('#content > div.section.inner_sub > iframe:nth-child(4)');
    const frame = await frameHandle.contentFrame();


    // await frame.waitForSelector('table.type2', { state: 'visible' });

    // 테이블 데이터 추출
    const rows = await frame.$$('body > table.type2 tbody tr');
    
    const prices = [];
    for (const row of rows) {
        const cells = await row.$$('td');
        if (cells.length >= 7) {
            const cleanedText = text => text.replace(/\s+/g, ' ').trim();

            const date = await cells[0].textContent();
            const closePrice = await cells[1].textContent();
            const compareToYesterday = cleanedText(await cells[2].textContent());
            if (/^\d{4}\.\d{2}\.\d{2}$/.test(date.trim())) {
                prices.push({ date: date.trim(), closePrice: closePrice.trim(), compareToYesterday: compareToYesterday.trim()  });
            }
        }
    }

    console.log('일별 시세:', prices);
    console.log('추출된 행 수:', prices.length);

} catch (error) {
    console.error('에러 발생:', error);
}

// 디버깅을 위해 잠시 대기
await newPage.waitForTimeout(5000);
});
