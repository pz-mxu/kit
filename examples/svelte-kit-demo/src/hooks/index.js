/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ request, render }) {
	const response = await render(request);

	if (response.headers['content-type'] === 'text/html') {
		const locale = request.path.match(/^\/([a-z]{2})(\/|$)/)?.[1];
		return {
			...response,
			body: response.body.replace('%svelte.lang%', locale)
		};
	}

	return response;
}
