import * as cheerio from 'cheerio';

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
];

const getHeaders = () => ({
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Device-Memory': '8',
    'Service-Worker-Navigation-Preload': 'true',
    'Upgrade-Insecure-Requests': '1',
    'DNT': '1',
    'Connection': 'keep-alive',
});

export interface AmazonProductData {
    asin: string;
    title: string;
    price: string;
    mrp: string;
    soldBy: string;
    category: string;
    rating: string;
    reviews: string;
    images: number;
    bsr: string;
    description: string;
    bullets: string[];
    hasAPlus: boolean;
    hasStore: boolean;
    url: string;
    targetKeyword?: string;
    error?: string;
}

export async function scrapeAmazonProduct(asin: string, domain: string = 'amazon.in'): Promise<AmazonProductData> {
    const url = `https://www.${domain}/dp/${asin}`;

    try {
        const response = await fetch(url, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 503) {
                throw new Error('Amazon blocked request (503). Try again later.');
            }
            throw new Error(`Failed to fetch product page. Status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Title
        const title = $('#productTitle').text().trim() || $('#title').text().trim() || 'N/A';

        // 2. Price & MRP
        const price = $('.a-price-whole').first().text().trim() ||
            $('#priceblock_ourprice').text().trim() ||
            $('.a-price .a-offscreen').first().text().trim() || 'N/A';

        const mrp = $('.a-text-strike').first().text().trim() ||
            $('#listPrice').text().trim() ||
            $('.a-text-price span.a-offscreen').first().text().trim() || 'N/A';

        // 3. Sold By
        let soldBy = $('#merchant-info').text().trim() || $('#sellerProfileTriggerId').text().trim() || 'N/A';
        soldBy = soldBy.replace(/Sold by\s+/i, '').replace(/\s+and Fulfilled by Amazon\./i, '').trim();

        // 4. Category
        let category = $('#wayfinding-breadcrumbs_feature_div').text().trim() || $('.a-breadcrumb').text().trim() || 'N/A';
        category = category.replace(/\s+/g, ' ').replace(/>/g, ' > ').trim();

        // 5. Rating & Reviews
        const rating = $('#acrPopover').attr('title') || $('.a-icon-star').attr('title') || 'N/A';
        const reviews = $('#acrCustomerReviewText').text().trim() || $('.a-size-small .a-link-normal').text().trim() || 'N/A';

        // 6. Images
        const imageCount = $('#altImages li.item').length || $('.imageThumbnail').length || 0;

        // 7. Bullets & Description
        const bullets: string[] = [];
        $('#feature-bullets ul li span.a-list-item').each((_, el) => {
            const text = $(el).text().trim();
            if (text) bullets.push(text);
        });

        const description = $('#productDescription').text().trim() || $('.aplus-v2').text().trim() || 'N/A';

        // 8. A+ Content & Brand Store Precise Detection
        const hasAPlus = $('.aplus-v2, #aplus, .aplus-module').length > 0;
        const brandStoreLink = $('#bylineInfo').attr('href') || '';
        const hasStore = brandStoreLink.includes('/stores/') || brandStoreLink.includes('/node/') || $('.s-brand-store-banner').length > 0;

        // 8. BSR
        let bsr = 'N/A';
        const bodyText = $('body').text();
        const bsrMatch = bodyText.match(/#([0-9,]+)\s+in/i);
        if (bsrMatch) bsr = bsrMatch[1];

        return {
            asin,
            title,
            price: price.replace(/[^\d,.]/g, ''),
            mrp: mrp.replace(/[^\d,.]/g, ''),
            soldBy,
            category: category.length > 100 ? category.substring(0, 100) + '...' : category,
            rating,
            reviews,
            images: imageCount,
            bsr,
            description: description.substring(0, 500), // Cap for preview
            bullets,
            hasAPlus,
            hasStore,
            url,
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Scraping error for ASIN ${asin}:`, errorMessage);
        return {
            asin,
            title: 'Error',
            price: 'N/A',
            mrp: 'N/A',
            soldBy: 'N/A',
            category: 'N/A',
            rating: 'N/A',
            reviews: 'N/A',
            images: 0,
            bsr: 'N/A',
            description: 'N/A',
            bullets: [],
            hasAPlus: false,
            hasStore: false,
            url,
            error: errorMessage,
        };
    }
}

export interface RankResult {
    organicRank: number | null;
    sponsoredRank: number | null;
    page: number | null;
    price: string | null;
    status: 'Organic' | 'Sponsored' | 'Not Found';
    error?: string;
}

export async function findAsinRank(asin: string, keyword: string, domain: string = 'amazon.in'): Promise<RankResult> {
    const headers = getHeaders();
    let organicCount = 0;
    const maxPages = 10;

    for (let page = 1; page <= maxPages; page++) {
        const url = `https://www.${domain}/s?k=${encodeURIComponent(keyword)}&page=${page}`;

        try {
            const response = await fetch(url, { headers });

            if (!response.ok) {
                if (page === 1) throw new Error(`Failed to fetch search results. Status: ${response.status}`);
                break;
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            let foundOnThisPage = false;
            let result: RankResult | null = null;

            $('[data-asin]').each((_, el) => {
                const currentAsin = $(el).attr('data-asin');
                if (!currentAsin || currentAsin === '') return;

                const isSponsored = $(el).find('.s-sponsored-label, .puis-sponsored-label-text').length > 0;

                if (!isSponsored) {
                    organicCount++;
                }

                if (currentAsin.toUpperCase() === asin.toUpperCase()) {
                    const price = $(el).find('.a-price-whole').first().text().trim() || 'N/A';
                    foundOnThisPage = true;

                    result = {
                        organicRank: isSponsored ? null : organicCount,
                        sponsoredRank: isSponsored ? 1 : null,
                        page,
                        price: price.replace(/[^\d,.]/g, ''),
                        status: isSponsored ? 'Sponsored' : 'Organic'
                    };
                    return false;
                }
            });

            if (foundOnThisPage && result) {
                return result;
            }

            const hasNext = $('.s-pagination-next').length > 0 && !$('.s-pagination-disabled').length;
            if (!hasNext) break;

            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

        } catch (error: unknown) {
            if (page === 1) throw error;
            break;
        }
    }

    return { organicRank: null, sponsoredRank: null, page: null, price: null, status: 'Not Found' };
}
