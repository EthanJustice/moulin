// hooks

const dispatch = (event, data, location) => {
    console.error(`dispatching ${event}`) // debug
    let customEvent = new CustomEvent(event, data);
    location.dispatchEvent(customEvent);
}