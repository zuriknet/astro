function getRenderer() {
	return {
		name: '@astrojs/lit',
		serverEntrypoint: '@astrojs/lit/server.js',
	};
}

function getConfiguration() {
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
						external: [
							'lit-element/lit-element.js',
							'@lit-labs/ssr/lib/install-global-dom-shim.js',
							'@lit-labs/ssr/lib/render-lit-html.js',
							'@lit-labs/ssr/lib/lit-element-renderer.js',
						],
					},
				};
}

/** @type { config: Readonly<AstroConfig>; assertDependency: (pkg: string, semver: string) => void; addRenderer: (mod: any | Promise<any>) => void } */
export default async function (astro) {
	// EXAMPLE: Preact Integration
	// In a future system, you would add preact by simply running `astro add preact`
	// or `astro setup preact` and then astro would take care of the rest.

	// addRenderer: Add a renderer to the project. This would most likely be stored
	// in the same package as the integration itself, so more likely: import('./renderer/index.js');
	console.log('START');
	astro.addRenderer(getRenderer());
	astro.applyConfiguration(getConfiguration());
	// TODO: Add polyfills:
	astro.addScriptImport('beforeHydration', '@astrojs/lit/client-shim.js');
	astro.addScriptImport('beforeHydration', '@astrojs/lit/hydration-support.js');


	// assertDependency: Assert that this is a dependency of the project.
	// astro.assertDependency('preact', '~10.5.0');

	// Example: React
	// astro.addRenderer(await import(`@astrojs` + `/renderer-react`));
	// astro.assertDependency('react', '^17.0.0');
	// astro.assertDependency('react-dom', '^17.0.0');
	// return astro.config.buildOptions.site;
}
