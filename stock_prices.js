const axios = require('axios');
const cheerio = require('cheerio');

async function getStockPrices(stockCode) {
    try {
        const url = `https://finance.naver.com/item/sise_day.nhn?code=${stockCode}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Cache-Control': 'max-age=0',
                'Referer': 'https://finance.naver.com/'
            },
            withCredentials: true
        });

        console.log('응답 상태 코드:', response.status);
        console.log('응답 헤더:', response.headers);

        const $ = cheerio.load(response.data);

        const prices = [];
        $('table.type2 tr').each((index, element) => {
            const $tds = $(element).find('td');
            if ($tds.length > 0) {
                const date = $tds.eq(0).text().trim();
                const closePrice = $tds.eq(1).text().trim();
                if (date && closePrice) {
                    prices.push({ date, closePrice });
                }
            }
        });

        console.log('일별 시세:', prices);
        console.log('추출된 행 수:', prices.length);
    } catch (error) {
        console.error('에러 발생:', error.message);
        if (error.response) {
            console.error('응답 상태:', error.response.status);
            console.error('응답 헤더:', error.response.headers);
        }
    }
}

// 요청 간 지연을 주는 함수
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    await getStockPrices('005930');  // 삼성전자
    await delay(2000);  // 2초 지연
    await getStockPrices('035720');  // 카카오
}

main();