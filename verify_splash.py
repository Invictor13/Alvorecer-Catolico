import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})

        # Open the index.html file
        file_path = f"file://{os.path.abspath('index.html')}"
        await page.goto(file_path)

        # Wait for the initial animations to finish (approx 3.5 seconds)
        await page.wait_for_timeout(3500)

        # Find the button and click it
        button = page.locator("button:has-text('ADENTRAR O PORTAL')").first
        if await button.count() > 0:
            await button.click()

            # Take a screenshot right after clicking to capture the exit transition
            await page.wait_for_timeout(500) # Wait a tiny bit for the scale transition to start

            os.makedirs("verification", exist_ok=True)
            await page.screenshot(path="verification/splash_exit_animation.png")
            print("Captured exit animation screenshot")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
