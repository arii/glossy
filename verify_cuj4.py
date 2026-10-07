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

        # Hover over the author InlineEdit span to show the pencil icon
        # Use a more robust selector targeting the span containing the edit icon
        metadata_spans = page.locator('.group.inline-flex.items-center')
        if await metadata_spans.count() > 1:
            await metadata_spans.nth(1).hover()
            await page.wait_for_timeout(500)

        # Take a screenshot
        await page.screenshot(path='/home/jules/verification/screenshots/verification4.png', full_page=True)

        await browser.close()

asyncio.run(run())
