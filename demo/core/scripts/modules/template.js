const loadTemplate = (name, appendTo) => {
	let template;
	fetch(`core/templates/${name}.html`).then(resp => { return resp.text() }).then(data => {
		const parser = new DOMParser();
		let content = parser.parseFromString(data, 'text/html');

		appendTo.appendChild(scopeCSS(content.querySelector('div')));
	}).catch(err => error(`Failed to load template.`, err));
	return template;
}