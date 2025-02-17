global.TextEncoder = class {
    encode(input) {
        return new Uint8Array(Buffer.from(input, 'utf-8'));
    }
};

global.TextDecoder = class {
    decode(input) {
        return Buffer.from(input).toString('utf-8');
    }
};

global.localStorage = {
    storage: {},
    getItem(key) {
        return this.storage[key] || null;
    },
    setItem(key, value) {
        this.storage[key] = value;
    },
    removeItem(key) {
        delete this.storage[key];
    },
    clear() {
        this.storage = {};
    }
};

const $ = require('jquery');
global.$ = global.jQuery = $;