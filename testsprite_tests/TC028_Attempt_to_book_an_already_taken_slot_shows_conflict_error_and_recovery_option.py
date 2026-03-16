import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:3000
        await page.goto("http://localhost:3000")
        
        # -> Click the 'Iniciar Sesión' link in the header (element index 88).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/nav/div/div[3]/a').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Navegar explícitamente a /login para cargar el formulario de acceso y continuar con el llenado de credenciales.
        await page.goto("http://localhost:3000/login")
        
        # -> Rellenar el campo Email (index 1042) y Contraseña (index 1043) con las credenciales proporcionadas y clicar el botón 'Iniciar sesión' (index 1045).
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/form/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('danidos@hotmail.com')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/form/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('DaNi26')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/form/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Clicar el elemento 'Reservas' en la barra lateral (index 1499) para abrir la sección de reservas.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/aside/div/nav/a[5]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Clicar el botón 'RESERVAR AHORA' de la tarjeta 'Piscina' para abrir el flujo de reserva (usar el botón interno index 2315).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/main/section/div/div/div[2]/div/div/div/div[4]/a/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert '/home' in current_url
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    