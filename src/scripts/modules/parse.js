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

const renderJS = element => {
    if (!element) return false;

    if (!element.querySelector("script")) return element;
    let link = element.querySelector("script").src;

    let script = buildElement("script", {
        src: link,
    });

    script.addEventListener(
        "load",
        () => {
            dispatch(
                "script-loaded",
                {
                    detail: {
                        type: "slide",
                        link: link,
                    },
                },
                window
            );
        },
        { once: true }
    );

    element.remove(element.querySelectorAll("script"));
    element.appendChild(script);

    return element;
};

export { buildElement, scopeCSS, renderJS };
