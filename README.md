# moulin

lightweight presentation generator

[Demo](https://ethanjustice.github.io/moulin/) | [Repository](https://github.com/EthanJustice/moulin)

[Moulin (Wikipedia)](https://en.wikipedia.org/wiki/Moulin_(geomorphology))
![A moulin](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Moulin_on_Snowbird_Glacier%2C_below_the_Snowbird_Glacier_Hut._Talkeetna_Mountains%2C_Alaska.JPG/1200px-Moulin_on_Snowbird_Glacier%2C_below_the_Snowbird_Glacier_Hut._Talkeetna_Mountains%2C_Alaska.JPG)

## Table of Contents

+ [Roadmap](#roadmap)
+ [Usage](#usage)
+ [Docs](#docs)

## Roadmap

+ Lifecycle diagrams
+ `dist` version
+ Internal unification of items
+ Better docs

## Usage

**Note**: any usage of `ctrl` correlates to the `cmd` key

### Slide Controls

+ `left arrow key` - moves back a slide
+ `right arrow key OR spacebar` - moves forward a slide
+ `ctrl + left arrow key` - moves to the first slide
+ `ctrl + right arrow key OR 9` - moves to the last slide
+ `1...8` - moves to the specified slide

### General

+ `t` - cycles themes defined in [config file](#keys)
+ `d` - toggles the [dashboard](#dashboard-menu)
+ `s` - toggles the [table of contents](#table-of-contents-menu)

## Docs

As a general note, any user-facing indexes (permalinks, current slide number, etc.) will **not** be zero-based; that is, the first slide will have an internal index of `0`, but would be `1` on any permalink.

+ [Notes](#notes)
+ [Setup](#setup)
+ [Slides](#slides)
+ [Config File](#config-file)
+ [Hooks](#hooks)
+ [Using the Core](#using-the-core)
+ [Layout](#layout)
+ [Examples](#examples)

Example presentation

```plaintext
/slides - slides
/src - moulin src
global.css - global moulin styling
index.html - presentation skeleton
moulin.json - moulin config for demo
```

### Notes

+ See [alder.js](https://github.com/EthanJustice/alder.js) for information on scoped-CSS.

+ The `data-toc` attribute is not checked for its order; that is, if the listed number is smaller than the previous or larger than the next, Moulin will not throw any errors.  This makes it possible to have a malformed index.

+ `toc` is a reserved keyword for hashes

+ When adding themes it's important to note that `.dark` and `.light` are special classes, as they will be automatically added depending on if `(prefers-color-scheme:dark)` is `true` or `false`.  If you don't add a media query in CSS that's immediately loaded, this may cause a flash of default colours.

### Setup

For now, the easiest way to use Moulin is to clone the repo (`git clone https://github.com/EthanJustice/moulin.git`) and then proceed from there.

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
| default | string ("slides", "dashboard", "toc") | The specified value will be opened automatically. | "dashboard" | No (defaults to, "slides.") |
| prod | Boolean | If set to `true`, Moulin is run in production mode, and caches slides. | true | No |
| version | string | Current version of the presentation (used to open a cache in production version and for display in the dashboard).  The cache name is prefixed with `moulin-`, so any attempt to open Moulin's cache must keep that in mind | "0.0.1" "two" | Yes if in production mode |
| permalinks | string ("name", "index") | If set, enables permalinks for each individual slide (e.g. `site.tld/#{slide}` would open to the specified slide).  The, "name," value will set permalinks to the name of the slide (the `data-next` attribute), while the, "index," value will set it to the index of the slide | `name` | No |
| disabled | array ("dashboard", "preview") | If set, disables the specified item(s), so that they can't be activated by the user | ["dashboard"] | No |

### Hooks

Moulin also has a built-in hooks system, for when you want flashy, over-the-top animations.
Moulin currently supports 7 hooks:

| Hook | Element to Watch | Values | Description |
| ---- | ---------------- | ------ | ----------- |
| `slide-loaded` | `window` | "{slideName}" | a slide has finished loading |
| `slide-loading-finished` | `window` | {<br>data: {<br>&nbsp;duration: number (represents the total time it took to load all slides, in milliseconds)<br>&nbsp;loaded: Boolean (represents whether the slides loaded successfully or not)<br>},<br>slides: number (total number of slides)<br>} | all slides have finished loading |
| `before-slide-change` | `window` | { new: newSlideIndex, old: oldSlideIndex } | the active slide is about to be changed |
| `after-slide-change` | `window` | { new: newSlideIndex, old: oldSlideIndex } | the active slide has been changed |
| `slide-loading-failed` | `window` | "{indexOfSlideThatFailed}" | any slide isn't loaded (note that only the affected slide will be removed - that is, the presentation can be used without it) |
| `theme-change` | `window` | "{themeName}" | the theme is toggled by pressing the `t` key |
| `before-index-opened` | `window` | none | the table of contents menu is about to be opened |
| `after-index-opened` | `window` | none | the table of contents menu has been opened |
| `before-dashboard-opened` | `window` | none | the dashboard is about to be opened |
| `after-dashboard-opened` | `window` | none | the dashboard has been opened |
| `before-slides-opened` | `window` | none | the slide menu is about to be opened |
| `after-slides-opened` | `window` | none | the slide menu has been opened |
| `moulin-started` | `window` | none | Moulin has started loading |
| `moulin-ready` | `window` | none | Moulin has *completely* finished setup (loading slides, going to the proper slide, etc.) |

**Note**: the values specified in the square brackets (`[]`) above are accessed by using the `detail` property of an event object.  If there is a single value, that means that `event.detail` *is* the value, rather than another object.

```javascript
window.addEventListener(`slide-loading-failed`, (event) => {
    console.log(`Failed to load slide ${event.detail}!`); // will log a message with the index of the slide that failed should a slide fail to load for any reason
});
```

### Using the Core

As Moulin uses imports/exports, core functions and variables can be easily used within an external script.  For example, if you wanted to import controls for slides, you could place `import * as binds from './path/to/binds.js';` in your script.

#### Exports

If you're having trouble adding imports in FireFox, make sure you've set the `type` attribute of the script that imports/exports to `module`.

**Note**: items are not guaranteed to have a value immediately.  If you want to make sure they do, listen for the `moulin-ready` hook.

```plaintext
/modules/binds.js
    showMain - shows the main menu
    showDashboard - shows the dashboard menu
    showIndex - shows the table of contents menu
    updateIndicator - updates the element that displays the current slide
    goToSlide - goes to the specified slide

/modules/parse.js
    buildElement - convenience function for generating an html element
    Alder - alder class, for scoping CSS

/modules/timing.js
    Timer - timer class, measures timing of things (used by dashboard)
    addLoadIndicator - adds an item to the primary (overall loading time) submenu of the dashboard

core.js
    config - config from moulin.json, as a JavaScript object
    dispatch - function to dispatch a hook
    main - reference to the main element, which is the container of the slides
    preview - reference to the container of slide loading times in the dashboard (submenu of dashboard)
    dashboard - reference to the dashboard menu element
    index - reference to the index (table of contents) element
    slides - array of slide names, corresponds to the slideContent variable
    slideContent - array of html elements corresponding to the slides variable, made of the parsed slides
    loadingTimeElement - container for primary stat loading times in the dashboard (submenu of dashboard)
```

### Layout

Moulin is divided into three menus:

+ The [slides/main menu](#slides-menu), where slides are viewed [`h` key]
+ The [table of contents](#table-of-contents-menu) [`s` key]
+ The [dashboard](#dashboard-menu) (loading times and status) [`d` key]

#### Dashboard Menu

The dashboard contains meta-information about the loading times of various parts of Moulin, and the current mode Moulin is operating in.  It can be accessed by pressing the `d` key.

The dashboard takes the following shape:

+ `Presentation Name` `Mode` `Cache Version`
+ Loading times of config and slides
+ Total loading time
+ Loading times and status of individual slides

#### Table of Contents Menu

The table of contents is an automatically generated list of slides in order.  It can be accessed by pressing the `s` key.  In a slide, the [`data-toc` attribute](#supported-custom-attributes) can be set to provide a custom value.  There are some [implementation notes](#notes) for using the `data-toc` attribute.

#### Slides Menu

The slides menu is the primary method to view and navigate to slides.  It can be accessed by pressing `h` key.

### Examples

#### Themes

Custom themes are easily to make; they only require registering a `theme` value in the [Config](#config-file) and adding a `{themeName}` class somewhere in your CSS.

For example, if I wanted to add a theme `dark`, I would create a `.dark` class containing [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*).

`x.css`

```css
.dark {
    --primary-colour: #212121; /* background */
    --secondary-colour: #fafafa; /* text colour */
    --tertiary-colour: #404040; /* lighter background colour */
}
```

`moulin.json`

```json
{
    themes: ["dark", "light"]
    // ...
}
```

Pressing `t` will toggle themes, in the order of the array in the `moulin.json`.  There are also some caveats to themes; see the [notes](#notes).

#### Custom Slide Animations

Slide animations, in their simplest forms, can be a simple CSS rule.

```css
div[data-slide-name] {
    animation: 300ms fadeIn linear;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
```

You can also listen to one of the `x-slide-change` (see [Hooks](#hooks)) and apply more complex animations that way.

#### Getting the Name of the Current Slide

It's fairly simple to get the name of the currently active slide.  There are, in fact, several ways to do so.  All of these methods rely on Moulin having finished loading.  There should always be an active slide, even if the presentation doesn't load the `slides` part right away.

The easiest would be `query-selector`-ing the current slide, and then getting the `data-slide-name` attribute.

All slides should have a `data-slide-name` attribute automatically generated by Moulin.

```javascript
import { slides } from './src/scripts/core.js';

window.addEventListener('after-slide-change', (event) => {
    let activeSlide = document.querySelector('.main div[data-slide-name]').dataset.slideName;
    let activeSlideIndex = slides.indexOf(activeSlide);
});
```

The second method would be to listen to the `after-slide-change`, and use the `event.detail` values.  See the [Hooks](#hooks) section for event values.

```javascript
import { slides } from './src/scripts/core.js';

window.addEventListener('after-slide-change', (event) => {
    let activeSlideIndex = event.detail.new;
    let activeSlide = slides[activeSlideIndex];
});
```
