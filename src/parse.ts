import { Alder } from 'https://unpkg.com/alder.js@0.3.0/dist/index.js';

import { dispatch } from '../core.js';

// utils
const buildElement = (type, attributes, text) => {
    let element = document.createElement(type);
    element.innerText = text || '';
    if (attributes) {
        Object.keys(attributes).forEach((item) => {
            if (item.includes('data_')) {
                element.setAttribute(item.replace(new RegExp('_', 'g'), '-'), attributes[item]);
            } else {
                element[item] = attributes[item];
            }
        });
    }
    return element;
};

export { buildElement, Alder };
