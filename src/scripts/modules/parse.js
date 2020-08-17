import { dispatch } from '../core.js';

// utils
const buildElement = (type, attributes, text) => {
    let element = document.createElement(type);
    element.innerText = text || "";
    if (attributes) {
        Object.keys(attributes).forEach(item => {
            if (item.includes("data_")) {
                element.setAttribute(
                    item.replace(new RegExp("_", "g"), "-"),
                    attributes[item]
                );
            } else {
                element[item] = attributes[item];
            }
        });
    }
    return element;
};

// scoped css
// see https://github.com/EthanJustice/alder/
class Alder {
    constructor() {
        this.ids = [];
    }

    parse(element) {
        if (!element || !element.querySelector('style')) { return element };
        let sheet = element.querySelector("style");

        let rules = /:|@/;
        Object.values(sheet.sheet.rules).forEach(item => {
            if (item.selectorText.match(rules) == null) {
                element.querySelectorAll(`${item.selectorText}`).forEach(child => {
                    Object.values(item.style).forEach(prop => {
                        child.style[prop] = item.style[prop];
                    });
                });
            } else if (item.selectorText.includes(":")) {
                if (!element.id) element.dataset.alder = this._generate();
                document.styleSheets[0].insertRule(`${element.id || element.nodeName.toLowerCase()}[data-alder="${element.dataset.alder}"] > ${item.cssText}`, 0);
            }
        });

        sheet.remove();

        return element;
    }

    _generate() {
        let i = Math.ceil(Math.random() * 99999);
        if (this.ids.length == 99999) { return false }
        else if (this.ids.includes(i)) { i = this._generate() }

        return i;
    }
}

// scopes css
const scopeCSS = element => {
    if (!element) return false;

    if (!element.querySelector("style")) {
        return element;
    }
    let sheet = element.querySelector("style");
    Object.values(sheet.sheet.rules).forEach(item => {
        if (
            !item.selectorText.includes("@") &&
            !item.selectorText.includes(":")
        ) {
            element.querySelectorAll(`${item.selectorText}`).forEach(child => {
                Object.values(item.style).forEach(prop => {
                    child.style[prop] = item.style[prop];
                });
            });
        } else if (item.selectorText.includes(":")) {
            document.styleSheets[0].insertRule(item.cssText, 0);
        }
    });

    sheet.remove();

    return element;
};

// loads scripts from slide
const renderJS = element => {
    if (!element) return element;

    if (!element.querySelector("script")) return element;
    let link = element.querySelector("script").src;

    let script = buildElement("script", {
        src: link,
    });

    script.addEventListener("load", () => {
        dispatch("script-loaded", {
            detail: {
                type: "slide",
                link: link,
            },
        }, window);
    }, { once: true });

    element.querySelectorAll("script").forEach(s => s.remove());
    element.appendChild(script);

    return element;
};

export { buildElement, Alder, renderJS };
