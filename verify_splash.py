import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:8080")

        # Wait 2 seconds to capture Phase 1
        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification/phase1.png")
        print("Captured phase1.png")

        # Wait 5 more seconds to capture Phase 2
        await page.wait_for_timeout(5000)
        await page.screenshot(path="verification/phase2.png")
        print("Captured phase2.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
