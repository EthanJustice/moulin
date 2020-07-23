# moulin

lightweight presentation generator

## Roadmap

+ Permalinks
+ Number keybinds
+ Dashboard/main/preview opened/closed hook
+ Open preview config key

+ ~~Theme change hook~~
+ ~~Main functionality~~
+ ~~Dedicated show slides keybind~~

## Docs

### Slides

Slides are individual HTML files stored within the [slide directory](#config-keys), which can be customised in the config file.

A slide looks something like this:

```html
<div data-next="docs">
    <h1>Slide Name</h1>
</div>
```

Slides are an individual `div` element in its own file. If there is a following slide, link to it by setting the `data-next` of the `div` to the name of the next slide (the file name, excluding the
`.html`).

Any `style` elements within a slide will be scoped to that slide, so that each rule will only work on items in that slide.  If you want to customise global behaviour, set a [`global`](#keys) key value in the config file.

Additionally, any `script` elements will be loaded as well; there's even a hook for them!  Listen for the `script-loaded` `window` event to detect when they're loaded.  To make sure it's the right script, add a filter parameter to your callback, like the example below.

```javascript
let scriptToLoad = '/example/path.js';
window.addEventListener('script-loaded', (event) => {
    if (event.detail.type == 'slide' && event.detail.link == scriptToLoad) // proper slide script has loaded
});
```

### Config File

The config file is a JSON file located in the directory of the presentation's index file.

#### Keys

| Key | Values | Description | Examples |
| --- | ------ | ----------- | -------- |
| themes | [...classNames]|An array of class names, these are cycled through when the user changes the theme through the `T` keybind. | ["dark", "light"] |
| slide | string |A path to the starting slide (note that URLs must be relative to the presentation location) | "slides/index" || "content/slides/main" |
| slideDir | string | Path to the directory that contains the slides | "slides/" || "/content/slides" |
| global | string | Path to a custom stylesheet | "global.css" || "src/custom.css" |
| openDashboard | boolean | If set to true, the dashboard will be opened by default. | true |
| prod | boolean | If set to true, Moulin is run in production mode, and caches slides. | true |
| version | string | Current version of the presentation (used to open a cache in production version and for display in the dashboard).  The cache name is prefixed with `moulin-`, so any attempt to open Moulin's cache must keep that in mind | "0.0.1" || "two" |

### Hooks

Moulin also has a built-in hooks system, for when you want flashy, over-the-top animations.
Moulin currently supports 7 hooks:

+ `script-loaded` (`window`), for when a module or slide script has finished loading
+ `script-loading-finished` (`window`), for when all modules have finished loading
+ `slide-loaded` (`window`), for when a slide has finished loading
+ `slide-loading-finished` (`window`), for when all slides have finished loading
+ `slide-change` (`window`), for when the active slide has changed
+ `slide-loading-failed` (`window`), for when any slide isn't loaded (note that only the
    affected slide will be removed - that is, the presentation can be used without it)
+ `theme-change`, (`window`), for when the theme is toggled by pressing the `t`
    key
