import { Plugin as VitePlugin } from 'vite';
import { AstroConfig } from '../@types/astro.js';

export default function rollupPluginAstroScripts({config}: {config: AstroConfig}): VitePlugin {
	console.log('GO');

	return {
		name: 'astro:scripts',

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
				return config._ctx.scripts.filter(s => s.stage === 'beforeHydration').map(s => s.content).join('\n');
			}
			if (id === '$scripts/styles.js') {
				console.log('LOAD', id, config._ctx.styles);
				return config._ctx.styles.map(s => `import '${s.specifier}';`).join('\n');
			}
			// if (id === '$scripts/pre.js') {
			// 	console.log('LOAD', id);
			// 	return `
			// 		${partytownSnippetHtml}
			// 	`;
			// }
			return null;
		},
		buildStart() {
			this.emitFile({
				type: 'chunk',
				id:  '$scripts/beforeHydration.js',
				name: '$scripts/beforeHydration.js',
			});
		}
	};
}
