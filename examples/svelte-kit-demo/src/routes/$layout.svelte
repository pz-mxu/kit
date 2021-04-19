<script context="module">
	export const prerender = true;

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, context }) {
		const locale = page.path.match(/^\/([a-z]{2})(\/|$)/)?.[1];

		if (!locale) {
			return {
				status: 307,
				redirect: page.path === '/' ? '/en' : `/en${page.path}`
			};
		}

		return { status: 200 };
	}
</script>

<script>
	import Nav from '$lib/Nav.svelte';
	export let segment;
</script>

<Nav {segment} />

<main>
	<slot />
</main>

<style>
	:root {
		font-family: sans-serif;
	}

	main {
		max-width: 40em;
		margin: 0 auto;
	}
</style>
