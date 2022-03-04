import { Plugin as VitePlugin, UserConfig } from 'vite';
import { AstroConfig } from '../@types/astro.js';

export default function rollupPluginAstroScripts({ config }: { config: AstroConfig }): VitePlugin {
	console.log('GO');
	let viteConfig: UserConfig;
	let count = 0;

	return {
		name: 'astro:scripts',
		configResolved(c) {
			viteConfig = c as any;
		},

		async resolveId(id) {
			console.log('RESOLVE', id);
			if (id.startsWith('$scripts/')) {
				return id;
			}
			return undefined;
		},

		async load(id) {
			if (id === '$scripts/beforeHydration.js') {
				console.log('LOAD', id);
				return config._ctx.scripts
					.filter((s) => s.stage === 'beforeHydration')
					.map((s) => s.content)
					.join('\n');
			}
			if (id === '$scripts/bundle.js') {
				console.log(
					'LOAD',
					id,
					config._ctx.scripts
						.filter((s) => s.stage === 'bundle')
						.map((s) => s.content)
						.join('\n')
				);
				return config._ctx.scripts
					.filter((s) => s.stage === 'bundle')
					.map((s) => s.content)
					.join('\n');
			}
			return null;
		},
		buildStart(options) {
			// TODO(fks): Emitting this file during the SSR build causes this
			// to create a 404 URL due to an incorrect file hash. Emitting
			// it only during the client build (and at no other stage)
			// causes it to work correctly. This could be due to some
			// overwrite happening to some map that we keep ourselves.
			// I need to ask @matthewp for help :)
			// FEEDBACK: Possible to add as topLevelImport to static build? Matthew thinks so!
			// Maybe document that emitFile may not work in static-build in some cases.
			if (count++ === 2) {
				console.log('BUILD STaRT', new Error().stack);
				this.emitFile({
					type: 'chunk',
					id: '$scripts/beforeHydration.js',
					name: '$scripts/beforeHydration.js',
				});
			}
		},
	};
}
