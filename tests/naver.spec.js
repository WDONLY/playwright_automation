const { test, expect } = require('@playwright/test');

test('네이버 증권으로 가서 삼성전자 일별 시세 가져오기', async ({ page }) => {
    await page.goto('https://www.naver.com/');
    await expect(page).toHaveTitle(/NAVER/);

    const newPagePromise = page.context().waitForEvent('page');
    await page.locator('#shortcutArea > ul > li:nth-child(6) > a > span.service_name').click();
    const newPage = await newPagePromise;
    
    console.log('새로운탭 url:', newPage.url());
    await expect(newPage).toHaveTitle(/네이버페이 증권/);

    await newPage.locator('#stock_items').click();
    await newPage.locator('#stock_items').fill('삼성전자');
    await newPage.locator('#atcmp > div.wrap_in > div > ul > li:nth-child(1) > a').click();

    console.log('새로운탭 url:', newPage.url());
   
    try {
        await expect(newPage).toHaveTitle( "삼성전자 : 네이버페이 증권");

        // '일별시세' 탭으로 이동
        await newPage.goto(`${newPage.url()}&page=1`);

        // 테이블이 로드될 때까지 기다림
        await newPage.waitForSelector('table.type2', { state: 'visible', timeout: 10000 });

        // 페이지의 HTML 내용 로깅
        const pageContent = await newPage.content();
        console.log('Page content:', pageContent);

        const prices = await newPage.evaluate(() => {
            const rows = document.querySelectorAll('table.type2 tbody tr');
            return Array.from(rows).map(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2 && cells[0].textContent.trim() !== '') {
                    return {
                        date: cells[0].textContent.trim(),
                        closePrice: cells[1].textContent.trim(),
                    };
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