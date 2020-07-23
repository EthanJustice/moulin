// main
// utils
const buildElement = (type, attributes, text) => {
	let element = document.createElement(type);
	element.innerText = text || '';
	if (attributes) {
		Object.keys(attributes).forEach(item => {
			if (item.includes('data_')) { element.setAttribute(item.replace(new RegExp('_', 'g'), '-'), attributes[item]) }
			else { element[item] = attributes[item] }
		});
	}
	return element;
}

const error = (msg, err) => {
	console.error(msg);
}

// timing

class Timer {
	constructor(name) {
		this.name = name;

		this.elapsed = 0;
		this.started;
		this.ended;
	}

	start() {
		this.started = Date.now();
	}

	stop() {
		this.ended = Date.now();
		this.elapsed = this.ended - this.started;
	}

	get elapsedMilliseconds() {
		return this.elapsed;
	}

	get elapsedSeconds() {
		return this.elapsed / 1000;
	}

	static toMilliseconds(seconds) {
		return seconds * 1000;
	}

	static toSeconds(milliseconds) {
		return milliseconds / 1000
	}
}

// slide loading
const load = async (name) => {
	let parse = (element) => {
		const parser = new DOMParser();
		let content = parser.parseFromString(element, 'text/html');

		return renderJS(scopeCSS(content.querySelector('div')));
	}

	if (config.prod == true) {
		return await caches.open(`moulin-${config.version}`).then((cache) => {
			return cache.keys(`${name}.html`).then((data) => {
				if (data.length == 0) {
					return cache.add(`${name}.html`).then(() => {
						return fetch(`${name}.html`).then(resp => resp.text()).then(element => parse(element));
					});
				} else {
					return data.map(item => {
						return cache.match(item.url).then((resp) => {
							return resp.clone().text().then((element) => { return parse(element) })
						});
					});
				}
			});
		});
	} else {
		return await fetch(`${name}.html`).then(resp => { return resp.text() }).then(data => { return parse(data) })
	}
}

// core
let status = {
	modules: {
		loaded: false,
		percentage: 0
	},
	slides: {
		loaded: false,
		percentage: 0
	}
};

const loadingTimeElement = buildElement('div', {
	className: 'fadeIn loading-indicator'
});

document.querySelector('.dashboard').insertBefore(loadingTimeElement, document.querySelector('.dashboard').firstChild);

let slides = [];
let slideContent = [];

async function getConfig() {
	return await fetch('./config.json').then(resp => { return resp.json() });
}

let config;

let configTimer = new Timer('config');
configTimer.start();

getConfig().then(data => {
	config = data;

	addLoadIndicator(`${config.name} ${config.prod ? 'Production' : 'Development'} ${config.version.includes('v') ? config.version : `v${config.version}`}`, 0)

	configTimer.stop();
	status.config = {
		duration: configTimer.elapsedMilliseconds
	};
	addLoadIndicator(`Config`, configTimer.elapsedMilliseconds);

	start(config);

	if (config.global) {
		document.head.appendChild(buildElement('link', {
			rel: 'stylesheet',
			type: 'text/css',
			href: config.global
		}));
	}

	if (config.default == 'dashboard') {
		document.querySelector('.dashboard').classList.remove('hidden');
	} else if (config.default == 'preview') {
		document.querySelector('.slide-preview-container').classList.remove('hidden');
	}
});

const dispatch = (event, data, location) => {
	console.error(`dispatching ${event}`) // debug
	let customEvent = new CustomEvent(event, data);
	location.dispatchEvent(customEvent);
}

const modList = [
	'parse',
	'binds',
];

const start = (config) => {
	const modContainer = buildElement('div', {
		id: 'scripts',
	});

	let loadTimes = {};

	modList.forEach((item, index) => {
		loadTimes[item] = {
			timer: new Timer(item),
			name: item
		};

		let script = buildElement('script', {
			src: `src/scripts/modules/${item}.js`
		});

		modContainer.appendChild(script);
		loadTimes[item].timer.start();

		script.addEventListener('load', () => {
			loadTimes[item].timer.stop();

			status.modules.percentage = parseInt(((index + 1) / modList.length) * 100);

			if (script.src.replace(window.location.href.replace(window.location.hash, ''), '').replace('src/scripts/modules/', '').replace('.js', '') == modList[modList.length - 1]) {
				loadSlides(config);

				status.modules = {
					loaded: true,
					percentage: 100,
					duration: Object.values(loadTimes).reduce((p, n) => p.timer.elapsedMilliseconds + n.timer.elapsedMilliseconds)
				};

				dispatch('script-loading-finished', {
					detail: {
						data: status.modules
					}
				}, window);
			}

			dispatch('script-loaded', {
				detail: {
					name: item,
					slides: slides.length
				}
			}, window);
		}, { once: true });
	});

	document.body.appendChild(modContainer);

	const loadSlides = (data) => {
		let inferredDir;
		let loadTimes = {};
		const fetchSlide = (slide) => {
			if (slide == config.index && !config.slideDir) inferredDir = `${slide.split('/')[0]}/`;
			if (!slide.includes('/')) slide = `${config.slideDir || inferredDir}${slide}`;

			let name = slide.split('/')[slide.split('/').length - 1].replace('.html', '');

			slides.push(name);

			loadTimes[name] = {
				timer: new Timer(name),
				name: name
			}

			loadTimes[name].timer.start();
			return load(slide.replace('.html', '')).then(item => {
				const register = (element) => {
					if (element != null && element != false) {
						element.dataset.slideName = name;
						slideContent.push(element);

						loadTimes[name].timer.stop();

						let newPreview = buildElement(`p`, {
							className: 'slide-preview',
							data_slide_index: name
						}, `Loaded slide "${slides[slides.length - 1]}," in ${loadTimes[name].timer.elapsedMilliseconds}ms (${loadTimes[name].timer.elapsedSeconds}s)`);

						let newPreviewStatus = buildElement(`span`, {
							className: "slide-preview-status loading"
						});

						newPreview.prepend(newPreviewStatus);

						window.addEventListener('slide-loaded', (event) => {
							if (event.detail != name) return
							newPreviewStatus.classList.remove('loading');
							newPreviewStatus.classList.add('loaded');
						});

						window.addEventListener('slide-loading-failed', (event) => {
							if (event.detail != slides.indexOf(name)) return
							newPreviewStatus.classList.remove('loading');
							newPreviewStatus.classList.add('loading-failed');
						});

						newPreview.addEventListener('click', () => {
							goToSlide(slides.indexOf(newPreview.dataset.slideIndex));
						});

						document.querySelector('.slide-preview-container').appendChild(newPreview);

						dispatch(`slide-loaded`, {
							detail: name
						}, window);

						if (element.dataset.next) {
							if (slides.indexOf(element.dataset.next) == -1) {
								fetchSlide(element.dataset.next);
							}
						} else {
							status.slides = {
								loaded: true,
								percentage: 100,
								duration: Object.values(loadTimes).reduce((p, n) => p.timer.elapsedMilliseconds + n.timer.elapsedMilliseconds)
							};

							dispatch('slide-loading-finished', {
								detail: {
									data: status.slides,
									slides: slides.length
								}
							}, window);
						}
					} else {
						slides.pop();
						dispatch(`slide-loading-failed`, {
							detail: slides.indexOf(name)
						}, window);

						addLoadIndicator(`slides`);

						if (document.querySelector(`p[data-slide-index="${slides.indexOf(name)}"]`)) {
							document.querySelector(`p[data-slide-index="${slides.indexOf(name)}"]`).classList.remove('loading');
							document.querySelector(`p[data-slide-index="${slides.indexOf(name)}"]`).classList.add('loading-failed');
						} else {
							let newPreviewMessage = buildElement(`p`, {
								className: 'slide-preview',
								data_slide_index: name
							}, `Failed to load slide ${slideContent.length + 1}`);

							let newPreviewStatus = buildElement(`span`, {
								className: "slide-preview-status loading-failed"
							});

							newPreviewMessage.prepend(newPreviewStatus);

							document.querySelector('.slide-preview-container').appendChild(newPreviewMessage);
						}
					}
				}

				if (Array.isArray(item)) {
					return item[0].then(element => {
						register(element);
					});
				} else {
					register(item);
				}

			}).catch(err => {
				dispatch(`slide-loading-failed`, {
					detail: slides.indexOf(name)
				}, window);
				error(err);
			});
		};

		fetchSlide(data.index).then(() => {
			if (document.querySelector('.main')) {
				document.querySelector('.main').insertBefore(slideContent[0], document.querySelector('.main').firstChild);
				if (!config.default || config.default == 'slides') {
					if (!window.location.hash) history.pushState(``, document.title, `#${1}`);
					document.querySelector('.main').classList.remove('hidden');
				}
			}
		});
	}
};

const addLoadIndicator = (type, duration) => {
	if (duration) {
		loadingTimeElement.appendChild(buildElement(`p`, {
			className: `${type == 'Everything' ? "loading-indicator-success" : ""}`
		}, `${type} loaded in ${duration}ms (${Timer.toSeconds(duration)}s)`))
	} else if (duration == 0) {
		loadingTimeElement.appendChild(buildElement(`p`, {
			className: "loading-indicator-version"
		}, `${type}`));
	} else {
		loadingTimeElement.appendChild(buildElement(`p`, {
			className: "loading-indicator-failure"
		}, `Failed to load ${type}.`))
	}
}

window.addEventListener('script-loading-finished', (event) => {
	addLoadIndicator(`${modList.length} modules`, event.detail.data.duration);
}, { once: true });

window.addEventListener('slide-loading-finished', (event) => {
	if (window.location.hash) {
		goToSlide(window.location.hash.replace('#', '') - 1);
	}

	if (config.prod) {
		caches.open(`moulin-${config.version}`).then((cache) => {
			cache.keys().then((data) => {
				if (data.length != 0) {
					addLoadIndicator(`${event.detail.slides} slides (cached)`, event.detail.data.duration);
				} else {
					addLoadIndicator(`${event.detail.slides} slides`, event.detail.data.duration);
				}
			});
		});
	} else {
		addLoadIndicator(`${event.detail.slides} slides`, event.detail.data.duration);
	}

	let t = 0;
	Object.values(status).forEach(item => t += item.duration);
	addLoadIndicator(`Everything`, t);
}, { once: true });