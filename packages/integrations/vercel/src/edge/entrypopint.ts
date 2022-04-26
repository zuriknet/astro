import './shim.js';

import type { SSRManifest } from 'astro';
import { App } from 'astro/app';

export function createExports(manifest: SSRManifest) {
	const app = new App(manifest);

	const handler = async (request: Request): Promise<Response | void> => {
		if (app.match(request)) {
			return app.render(request);
		}

		return new Response(null, {
			status: 404,
			statusText: 'Not found',
		});
	};

	return { default: handler };
}