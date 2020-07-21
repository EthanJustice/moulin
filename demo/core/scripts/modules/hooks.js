// hooks
const dispatch = (event, data, location) => {
    console.error(`dispatching ${event}`) // debug
    let customEvent = new CustomEvent(event, data);
    location.dispatchEvent(customEvent);

    if (location.dataset.template) {
        let windowCustomEvent = new CustomEvent(event, {
            detail: {
                location: location.dataset.template
            }
        });
        window.dispatchEvent(windowCustomEvent);
    }
}