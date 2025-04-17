module.exports = {
    testDir: './tests',
    timeout: 15000,
    fullyParallel: true,
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        baseURL: 'http://localhost',
        ignoreHTTPSErrors: true,
    },
    workers: process.env.CI ? 2 : undefined, // Use 2 worker in CI, otherwise use the default number of workers
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
        {
            name: 'firefox',
            use: { browserName: 'firefox' },
        },
        {
            name: 'webkit',
            use: { browserName: 'webkit' },
        },
    ],
};