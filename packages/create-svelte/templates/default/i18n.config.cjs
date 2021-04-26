const locales = require('./locales.json');

const defaultLocale = locales[0];

/** @typedef {{
 *   content: string;
 *   dynamic: boolean;
 *   spread: boolean;
 * }} Part */

/**
 * Create localized routes prefixed with locale
 * @param {Part[][]} segments
 * @returns {Part[][][]}
 */
function localizeRoutes(segments) {
	return locales.map((locale) =>
		locale === defaultLocale
			? segments
			: [
					[{ content: locale, dynamic: false, spread: false }],
					...segments.map((segment) => segment.map((part) => translate(part)))
			  ]
	);
}

/**
 * Translate part of a route segment
 * @param {Part} part
 * @returns {Part}
 */
function translate(part) {
	if (part.content === 'about') return { ...part, content: 'ueber' };
	return part;
}

const config = {
	defaultLocale,
	locales,
	localizeRoutes
};

module.exports = config;
