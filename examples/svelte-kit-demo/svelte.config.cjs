const adapter = require(process.env.ADAPTER || '@sveltejs/adapter-node');
const options = JSON.stringify(process.env.OPTIONS || '{}');

module.exports = {
	kit: {
		adapter: adapter(options),
		alternateRoutes: (segments) => {
			const locales = ['de', 'en'];
			return [
				segments,
				...locales.map((locale) => [
					[{ content: locale, dynamic: false, spread: false }],
					...segments
				])
			];
		},
		target: '#svelte'
	}
};
