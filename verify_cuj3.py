import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate to the editor for Ohthere text
        await page.goto('http://localhost:3000/edit/ohthere')

        # Wait for the page to load
        await page.wait_for_timeout(2000)

        # Hover over the Title InlineEdit span to show the pencil icon
        title_span = page.locator('text="The voyages of Ohthere and Wulfstan"').first
        await title_span.hover()
        await page.wait_for_timeout(500)

        # Take a screenshot
        await page.screenshot(path='/home/jules/verification/screenshots/verification3.png', full_page=True)

        await browser.close()

asyncio.run(run())
