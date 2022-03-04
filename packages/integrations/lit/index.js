function getViteConfiguration() {
	return {
		optimizeDeps: {
			include: [
				'@astrojs/lit/client-shim.js',
				'@astrojs/lit/hydration-support.js',
				'@webcomponents/template-shadowroot/template-shadowroot.js',
				'lit/experimental-hydrate-support.js',
			],
			exclude: ['@astrojs/lit/server.js'],
		},
		ssr: {
			external: ['lit-element/lit-element.js', '@lit-labs/ssr/lib/install-global-dom-shim.js', '@lit-labs/ssr/lib/render-lit-html.js', '@lit-labs/ssr/lib/lit-element-renderer.js'],
		},
	};
}

export default async function () {
	return {
		name: '@astrojs/lit',
		hooks: {
			'astro:config:setup': ({ config, addRenderer, injectScript }) => {
				injectScript('beforeHydration', `import '@astrojs/lit/client-shim.js';`);
				injectScript('beforeHydration', `import '@astrojs/lit/hydration-support.js';`);
				addRenderer({
					name: '@astrojs/lit',
					serverEntrypoint: '@astrojs/lit/server.js',
				});
				return {
					vite: getViteConfiguration(),
				};
			},
		},
	};
}
