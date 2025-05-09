module.exports = {
    testDir: './tests',
    timeout: 30000,
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    use: {
        headless: true,
        viewport: {width: 1280, height: 720},
        baseURL: 'http://localhost',
        ignoreHTTPSErrors: true,
    },
    workers: process.env.CI ? 2 : undefined,
    projects: [
        {
            name: 'chromium',
            use: {browserName: 'chromium'},
        },
        {
            name: 'firefox',
            use: {browserName: 'firefox'},
        },
        {
            name: 'webkit',
            use: {browserName: 'webkit'},
        },
    ],
};