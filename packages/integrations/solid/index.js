function getRenderer() {
	return {
		name: '@astrojs/solid',
		clientEntrypoint: '@astrojs/solid/client.js',
		serverEntrypoint: '@astrojs/solid/server.js',
		jsxImportSource: 'solid-js',
		jsxTransformOptions: async ({ ssr }) => {
			const [{ default: solid }] = await Promise.all([import('babel-preset-solid')]);
			const options = {
				presets: [solid({}, { generate: ssr ? 'ssr' : 'dom', hydratable: true })],
				plugins: [],
			};

			return options;
		},
	};
}

function getViteConfiguration(isDev) {
	// https://github.com/solidjs/vite-plugin-solid
	// We inject the dev mode only if the user explicitely wants it or if we are in dev (serve) mode
	const nestedDeps = ['solid-js', 'solid-js/web', 'solid-js/store', 'solid-js/html', 'solid-js/h'];
	return {
		/**
		 * We only need esbuild on .ts or .js files.
		 * .tsx & .jsx files are handled by us
		 */
		esbuild: { include: /\.ts$/ },
		resolve: {
			conditions: ['solid', ...(isDev ? ['development'] : [])],
			dedupe: nestedDeps,
			alias: [{ find: /^solid-refresh$/, replacement: '/@solid-refresh' }],
		},
		optimizeDeps: {
			include: nestedDeps,
			exclude: ['@astrojs/solid/server.js'],
		},
		ssr: {
			external: ['babel-preset-solid'],
		},
	};
}

export default function () {
	return {
		name: '@astrojs/solid',
		hooks: {
			'astro:config:setup': ({ config, command, addRenderer }) => {
				addRenderer(getRenderer());
				return {
					vite: getViteConfiguration(command === 'dev'),
				};
			},
		},
	};
}
