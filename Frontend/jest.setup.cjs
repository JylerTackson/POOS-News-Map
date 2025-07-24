require('@testing-library/jest-dom');

// Polyfill TextEncoder/TextDecoder for JSDOM
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Register DOM matchers
require('@testing-library/jest-dom');