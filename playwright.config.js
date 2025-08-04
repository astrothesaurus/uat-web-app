const {devices} = require('@playwright/test');
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
            name: 'Google Chrome',
            use: {
                browserName: 'chromium',
                channel: 'chrome',
            },
        },
        {
            name: 'Firefox',
            use: {browserName: 'firefox'},
        },
        {
            name: 'Webkit (Safari)',
            use: {browserName: 'webkit'},
        },
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
            },
        },
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 12'],
            },
        },
        {
            name: 'Mobile Samsung Galaxy (& Accessibility)',
            use: {
                ...devices['Galaxy S20'],
                reducedMotion: 'reduce',
                forcedColors: 'active',
            },
        },
        {
            name: 'Tablet iPad (& Accessibility)',
            use: {
                ...devices['iPad (gen 7)'],
                reducedMotion: 'reduce',
                forcedColors: 'active',
            },
        },
        {
            name: 'Tablet Android (Galaxy Tab S4)',
            use: {
                ...devices['Galaxy Tab S4'],
            },
        },
        {
            name: 'Edge (& Accessibility)',
            use: {
                browserName: 'chromium',
                channel: 'msedge',
                reducedMotion: 'reduce',
                forcedColors: 'active',
            },
        },
    ],
};