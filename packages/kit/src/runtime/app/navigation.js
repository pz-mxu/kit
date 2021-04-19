import { router } from '../client/singletons.js';
import { get_base_uri } from '../client/utils.js';

/**
 * @param {string} name
 */
function guard(name) {
	return () => {
		throw new Error(`Cannot call ${name}(...) on the server`);
	};
}

export const goto = import.meta.env.SSR ? guard('goto') : goto_;
export const prefetch = import.meta.env.SSR ? guard('prefetch') : prefetch_;
export const prefetchRoutes = import.meta.env.SSR ? guard('prefetchRoutes') : prefetchRoutes_;

/**
 * @type {import('$app/navigation').goto}
 */
async function goto_(href, opts) {
	return router.goto(href, opts, []);
}

/**
 * @type {import('$app/navigation').prefetch}
 */
function prefetch_(href) {
	return router.prefetch(new URL(href, get_base_uri(document)));
}

/**
 * @type {import('$app/navigation').prefetchRoutes}
 */
async function prefetchRoutes_(pathnames) {
	const matching = pathnames
		? router.routes.filter((route) => pathnames.some((pathname) => route[0].test(pathname)))
		: router.routes;

	const promises = matching.map((r) => r.length !== 1 && Promise.all(r[1].map((load) => load())));

	await Promise.all(promises);
}

/**
 * @param {RegExp} pattern
 * @param {string[]} params
 * @returns {string}
 */
function pathFromPattern(pattern, params) {
	let index = 0;
	return pattern.source
		.slice(1, -1)
		.replace(/\\\//g, '/')
		.replace(/\(\[\^\/\]\+\?\)/g, () => params[index++])
		.replace(/\/\?$/, '');
}

/**
 * @type {import('$app/navigation').alternates}
 */
export function alternates(href) {
	if (!import.meta.env.SSR) {
		const hrefRoute = router.routes.find((route) => route[0].test(href));
		if (!hrefRoute) return null;
		const [, ...params] = href.match(hrefRoute[0]);
		const alternates = router.routes.filter((route) => route[4] === hrefRoute[4]);
		return alternates.map((route) => pathFromPattern(route[0], params));
	}
	return null;
}
