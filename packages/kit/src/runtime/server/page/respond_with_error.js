import { render_response } from './render.js';
import { load_node } from './load_node.js';
import { coalesce_to_error } from '../../../utils/error.js';

/**
 * @typedef {import('./types.js').Loaded} Loaded
 * @typedef {import('types/internal').SSRNode} SSRNode
 * @typedef {import('types/internal').SSRRenderOptions} SSRRenderOptions
 * @typedef {import('types/internal').SSRRenderState} SSRRenderState
 */

/**
 * @param {{
 *   request: import('types/hooks').ServerRequest;
 *   options: SSRRenderOptions;
 *   state: SSRRenderState;
 *   $session: any;
 *   status: number;
 *   error: Error;
 * }} opts
 */
export async function respond_with_error({ request, options, state, $session, status, error }) {
	const default_layout = await options.manifest._.nodes[0](); // 0 is always the root layout
	const default_error = await options.manifest._.nodes[1](); // 1 is always the root error

	/** @type {Record<string, string>} */
	const params = {}; // error page has no params

	// error pages don't fall through, so we know it's not undefined
	const loaded = /** @type {Loaded} */ (
		await load_node({
			request,
			options,
			state,
			route: null,
			url: request.url, // TODO this is redundant, no?
			params,
			node: default_layout,
			$session,
			stuff: {},
			prerender_enabled: is_prerender_enabled(options, default_error, state),
			is_leaf: false,
			is_error: false
		})
	);

	const branch = [
		loaded,
		/** @type {Loaded} */ (
			await load_node({
				request,
				options,
				state,
				route: null,
				url: request.url,
				params,
				node: default_error,
				$session,
				stuff: loaded ? loaded.stuff : {},
				prerender_enabled: is_prerender_enabled(options, default_error, state),
				is_leaf: false,
				is_error: true,
				status,
				error
			})
		)
	];

	try {
		return await render_response({
			options,
			$session,
			page_config: {
				hydrate: options.hydrate,
				router: options.router.enabled,
				ssr: options.ssr
			},
			status,
			error,
			branch,
			url: request.url,
			params
		});
	} catch (err) {
		const error = coalesce_to_error(err);

		options.handle_error(error, request);

		return {
			status: 500,
			headers: {},
			body: error.stack
		};
	}
}

/**
 * @param {SSRRenderOptions} options
 * @param {SSRNode} node
 * @param {SSRRenderState} state
 */
export function is_prerender_enabled(options, node, state) {
	return (
		options.prerender && (!!node.module.prerender || (!!state.prerender && state.prerender.all))
	);
}
