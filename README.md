# moulin

lightweight presentation generator

[Moulin (Wikipedia)](https://en.wikipedia.org/wiki/Moulin_(geomorphology))
![A moulin](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Moulin_on_Snowbird_Glacier%2C_below_the_Snowbird_Glacier_Hut._Talkeetna_Mountains%2C_Alaska.JPG/1200px-Moulin_on_Snowbird_Glacier%2C_below_the_Snowbird_Glacier_Hut._Talkeetna_Mountains%2C_Alaska.JPG)

## Table of Contents

+ [Roadmap](#roadmap)
+ [Docs](#docs)

## Roadmap

+ Code commenting, better docs
+ Special TOC numbers (`data-index`)

## Docs

As a general note, any user-facing indexes (permalinks, current slide number, etc.) will **not** be zero-based; that is, the first slide will have an internal index of `0`, but would be `1` on any permalink.

+ [Slides](#slides)
+ [Config File](#config-file)
+ [Hooks](#hooks)
+ [Examples](#examples)

Example presentation

```plaintext
/slides - slides
/src - moulin src
global.css - global moulin styling
index.html - presentation skeleton
moulin.json - moulin config for demo
```

### Slides

Slides are individual HTML files stored within the [slide directory](#config-keys), which can be customised in the config file.

A slide looks something like this:

```html
<div data-next="docs" data-title="Slide Name">
    <h1>Slide Name</h1>
</div>
```

Slides are an individual `div` element in its own file. If there is a following slide, link to it by setting the `data-next` of the `div` to the name of the next slide (the file name, excluding the
`.html`).  It's important to note that slides **must** proceed in a linear fashion; that is, once one slide is linked from another, that slide **cannot** be linked again.

Any `style` elements within a slide will be scoped to that slide, so that each rule will only work on items in that slide.  If you want to customise global behaviour, set a [`global`](#keys) key value in the config file.  Note that pseudo-classes still work, but may create conflict if added to more than one slide [this is a known issue, and is being worked on].

Additionally, any `script` elements will be loaded as well; there's even a hook for them!  You can utilise the `script-loaded` `window` event to detect when they're loaded.

```javascript
let scriptToLoad = '/example/path.js';
window.addEventListener('script-loaded', (event) => {
    if (event.detail.type == 'slide' && event.detail.link == scriptToLoad) // proper slide script has loaded
    // ...
});
```

**Note**: it's not necessary to listen for the proper hook to execute JavaScript anymore.  Any JavaScript from the file will be executed as if it was hard-linked.

#### Scoped CSS Implementation Notes

See [alder.js](https://github.com/EthanJustice/alder.js).

#### Supported Custom Attributes

These are used by Moulin for custom behaviour.

| Key | Values | Description | Examples | Required |
| --- | ------ | ----------- | -------- | -------- |
| `data-next` | string | A link to the next slide (by referencing its file name; e.g, if you're linking to slide `docs`, then the file would be `{path}/docs.html`) | `data-next="last"` | Yes (unless it's the last slide) |
| `data-title` | string | Sets the tab's title when the slide is navigated to | `data-title="The view is lovely up here!"` | No (will revert to the document's original title) |
| `data-toc` | string | the custom index for the current slide to be used in the table of contents (all items have a `.` added, e.g. `{custom}. {slideName}`) | `data-toc="1.1"` | No |

### Config File

The config file is a JSON file located in the directory of the presentation's index file.  It **must** be named `moulin.json` and be located in the presentation root.

#### Keys

| Key | Values | Description | Examples | Required |
| --- | ------ | ----------- | -------- | -------- |
| themes | [...classNames] | An array of class names, these are cycled through when the user changes the theme through the `T` shortcut. | ["dark", "light"] | No |
| index | string |A path to the starting slide (note that URLs must be relative to the presentation location) | "slides/index"  "content/slides/main" | Yes |
| slideDir | string | Path to the directory that contains the slides | "slides/"  "/content/slides" | Only if the directory of slides isn't the same as the index slide |
| global | string | Path to a custom stylesheet (it's recommended to link to this in the HTML file controlling the presentation, rather than in the config, as it can cause unstyled content flashes) | "global.css"  "src/custom.css" | No |
| default | string ("slides", "dashboard", "preview") | The specified value will be opened automatically. | "dashboard" | No (defaults to, "slides.") |
| prod | Boolean | If set to `true`, Moulin is run in production mode, and caches slides. | true | No |
| version | string | Current version of the presentation (used to open a cache in production version and for display in the dashboard).  The cache name is prefixed with `moulin-`, so any attempt to open Moulin's cache must keep that in mind | "0.0.1" "two" | Yes if in production mode |
| permalinks | string ("name", "index") | If set, enables permalinks for each individual slide (e.g. `site.tld/#{slide}` would open to the specified slide).  The, "name," value will set permalinks to the name of the slide (the `data-next` attribute), while the, "index," value will set it to the index of the slide | `name` | No |
| disabled | array ("dashboard", "preview") | If set, disables the specified item(s), so that they can't be activated by the user | ["dashboard"] | No |

### Hooks

Moulin also has a built-in hooks system, for when you want flashy, over-the-top animations.
Moulin currently supports 7 hooks:

[To-Do: event values]

+ `script-loaded` (`window`), for when a slide script has finished loading
+ `script-loading-finished` (`window`), for when all modules have finished loading
+ `slide-loaded` (`window`), for when a slide has finished loading
+ `slide-loading-finished` (`window`), for when all slides have finished loading
+ `slide-change` (`window`), for when the active slide has changed
+ `slide-loading-failed` (`window`), for when any slide isn't loaded (note that only the
    affected slide will be removed - that is, the presentation can be used without it)
+ `theme-change` (`window`), for when the theme is toggled by pressing the `t`
    key
+ `preview-opened` (`window`), for when the preview menu is opened
+ `dashboard-opened` (`window`), for when the dashboard is opened
+ `slides-opened` (`window`), for when the slides are opened

### Examples

#### Themes

#### Custom Slide Animations
