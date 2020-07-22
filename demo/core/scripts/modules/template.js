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
