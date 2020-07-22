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
	configTimer.stop();
	addLoadIndicator(`Config`, configTimer.elapsedMilliseconds);

	start(config);

	if (config.global) {
		document.head.appendChild(buildElement('link', {
			rel: 'stylesheet',
			type: 'text/css',
			href: config.global
		}));
	}
});

const dispatch = (event, data, location) => {
	console.error(`dispatching ${event}`) // debug
	let customEvent = new CustomEvent(event, data);
	location.dispatchEvent(customEvent);
}

const start = (config) => {
	const modList = [
		'template',
		'parse',
		'binds',
	];

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
			src: `core/scripts/modules/${item}.js`
		});

		modContainer.appendChild(script);
		loadTimes[item].timer.start();

		script.addEventListener('load', () => {
			loadTimes[item].timer.stop();

			status.modules.percentage = parseInt(((index + 1) / modList.length) * 100);

			if (script.src.replace(window.location.href, '').replace('core/scripts/modules/', '').replace('.js', '') == modList[modList.length - 1]) {
				loadSlides(config);

				status.modules = {
					loaded: true,
					percentage: 100,
					duration: Object.values(loadTimes).reduce((p, n, index) => Object.values(loadTimes)[index].timer.elapsedMilliseconds + n.timer.elapsedMilliseconds)
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
		let loadTimes = {};
		const fetchSlide = (slide) => {
			if (!slide.includes('/')) slide = `${config.slideDir}${slide}`;

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

						let newPreview = buildElement(`span`, {
							className: 'slide-preview loading',
							data_slide_index: name
						}, slideContent.length);

						window.addEventListener('slide-loaded', (event) => {
							if (event.detail != name) return
							newPreview.classList.remove('loading');
							newPreview.classList.add('loaded');
						});

						window.addEventListener('slide-loading-failed', (event) => {
							if (event.detail != slides.indexOf(name)) return
							newPreview.classList.remove('loading');
							newPreview.classList.add('loading-failed');
						});

						newPreview.addEventListener('click', () => {
							goToSlide(newPreview.dataset.slideIndex);
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
								duration: Object.values(loadTimes).reduce((p, n, index) => Object.values(loadTimes)[index].timer.elapsedMilliseconds + n.timer.elapsedMilliseconds)
							};

							dispatch('slide-loading-finished', {
								detail: {
									data: status.slides,
									slides: slides.length
								}
							}, window);
						}
					} else {
						addLoadIndicator(`slides`);

						if (document.querySelector(`span[data-slide-index="${slides.indexOf(name)}"]`)) {
							document.querySelector(`span[data-slide-index="${slides.indexOf(name)}"]`).classList.remove('loading');
							document.querySelector(`span[data-slide-index="${slides.indexOf(name)}"]`).classList.add('loading-failed')
						} else {
							let newPreview = buildElement(`span`, {
								className: 'slide-preview loading-failed',
								data_slide_index: name
							}, slideContent.length + 1);

							newPreview.addEventListener('click', () => {
								goToSlide(newPreview.dataset.name);
							});

							document.querySelector('.slide-preview-container').appendChild(newPreview);
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

		fetchSlide(data.slide).then(() => {
			if (document.querySelector('.main')) {
				document.querySelector('.main').insertBefore(slideContent[0], document.querySelector('.main').firstChild);
			}
		});
	}

	dispatch('core-finished', {}, window);
};

const addLoadIndicator = (type, duration) => {
	if (duration) {
		loadingTimeElement.appendChild(buildElement(`p`, {}, `${type} loaded in ${duration}ms (${Timer.toSeconds(duration)}s)`))
	} else {
		if (Object.values(document.querySelectorAll('.slide-preview-container > p')).filter(item => item.innerText.toLowerCase().includes(type.toLowerCase())).length == 0) {
			loadingTimeElement.appendChild(buildElement(`p`, {
				className: "loading-indicator-failure"
			}, `Failed to load ${type}.`))
		}
	}
}

window.addEventListener('script-loading-finished', (event) => {
	addLoadIndicator(`Modules`, event.detail.data.duration);
}, { once: true });

window.addEventListener('slide-loading-finished', (event) => {
	addLoadIndicator(`${event.detail.slides} slides`, event.detail.data.duration);
}, { once: true });