<script>
	import { alternates } from '$app/navigation';
	import { page } from '$app/stores';

	$: alternatePaths = (alternates($page.path) || [])
		.map((path) => ({
			locale: path.match(/^\/([a-z]{2})(\/|$)/)?.[1],
			path
		}))
		.filter((a) => a.locale);
	$: defaultPath = alternatePaths?.find((a) => a.locale === 'en')?.path;
</script>

<svelte:head>
	{#if defaultPath}
		<link rel="alternate" hreflang="x-default" href={defaultPath} />
	{/if}
	{#each alternatePaths as { locale, path }}
		<link rel="alternate" hreflang={locale} href={path} />
	{/each}
</svelte:head>

<nav>
	<div>
		<a href="/" sveltekit:prefetch class:active={$page.path === '/'}>home</a>
		<a href="/about" sveltekit:prefetch class:active={$page.path === '/about'}>about</a>
		<a href="/blog" sveltekit:prefetch class:active={$page.path === '/blog'}>blog</a>
	</div>

	{#if alternatePaths.length > 0}
		<div>
			{#each alternatePaths as { locale, path }}
				<a href={path} class:active={$page.path === path} rel="external">{locale}</a>
			{/each}
		</div>
	{/if}
</nav>

<style>
	nav {
		border-bottom: 1px solid black;
		padding: 0 0 1em 0;
		margin: 0 0 1em 0;
		display: flex;
	}

	nav > :first-child {
		flex-grow: 1;
	}

	nav::after {
		content: '';
		display: table;
		clear: both;
	}

	a {
		display: block;
		float: left;
		color: rgba(0, 0, 0, 0.4);
		margin: 0 1em 0 0;
		text-decoration: none;
	}

	a + a::before {
		content: '•';
		color: rgba(0, 0, 0, 0.4);
		margin: 0 1em 0 0;
	}

	.active {
		color: rgba(0, 0, 0, 0.9);
	}
</style>
