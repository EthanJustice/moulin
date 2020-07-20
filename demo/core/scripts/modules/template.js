const loadTemplate = (name, appendTo) => {
	let template;
	fetch(`core/templates/${name}.html`).then(resp => { return resp.text() }).then(data => {
		const parser = new DOMParser();
		let content = parser.parseFromString(data, 'text/html');
		template = content.querySelector('div');
		appendTo.appendChild(template);		
	}).catch(err => error(`Failed to load template.`, err));
	return template;
}