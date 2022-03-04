import { svelte } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';

function getRenderer() {
	return {
		name: '@astrojs/svelte',
		clientEntrypoint: '@astrojs/svelte/client.js',
		serverEntrypoint: '@astrojs/svelte/server.js',
	};
}

function getViteConfiguration(idDev) {
	return {
		optimizeDeps: {
			include: ['@astrojs/svelte/client.js', 'svelte', 'svelte/internal'],
			exclude: ['@astrojs/svelte/server.js'],
		},
		plugins: [
			svelte({
				emitCss: true,
				compilerOptions: { dev: idDev, hydratable: true },
				preprocess: [
					preprocess({
						less: true,
						sass: { renderSync: true },
						scss: { renderSync: true },
						postcss: true,
						stylus: true,
						typescript: true,
					}),
				],
			}),
		],
	};
}

export default function () {
	return {
		name: '@astrojs/svelte',
		hooks: {
			// Anything that gets returned here is merged into Astro Config
			'astro:config:setup': ({ command, addRenderer }) => {
				addRenderer(getRenderer());
				return {
					vite: getViteConfiguration(command === 'dev'),
				};
			},
		},
	};
}
