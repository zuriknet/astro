import type { AddressInfo } from 'net';
import { AstroConfig, AstroIntegration, AstroRenderer } from '../@types/astro.js';
import { ViteDevServer } from 'vite';
// import { createRequire } from 'module';
// const resolvePackage = createRequire(import.meta.url).resolve;
// const resolved = resolvePackage(name);

export async function loadIntegrations(integrations: (Promise<any> | [Promise<any>, any])[]): Promise<AstroIntegration[]> {
	return await Promise.all(
		integrations.map(async (val: (Promise<any> | [Promise<any>, any])) => {
			// TODO: Finalize integration data structure
			const modAsync = Array.isArray(val) ? val[0] : val;
			const options = Array.isArray(val) ? val[1] : {};
			const mod = await modAsync;
			const integration = mod.default(options) as AstroIntegration;
			return integration;
		})
	);
}

export async function runHookConfigSetup({ config, command }: { config: AstroConfig; command: 'dev' | 'build' }) {
	for (const integration of config.integrations) {
		if (integration.hooks['astro:config:setup']) {
			const result = await integration.hooks['astro:config:setup']({
				config,
				command,
				addRenderer(renderer: AstroRenderer) {
					config._renderers.push(renderer);
				},
				injectHtml: () => {
					throw new Error('TODO: Implement');
				},
				injectScript: (stage, content) => {
					config._ctx.scripts.push({ stage, content });
				},
			});
			if (result) {
				integration._config = result;
			}
		}
	}
}

export async function runHookConfigDone({ config }: { config: AstroConfig }) {
	for (const integration of config.integrations) {
		if (integration.hooks['astro:config:done']) {
			await integration.hooks['astro:config:done']({
				config,
			});
		}
	}
}

export async function runHookServerSetup({ config, server }: { config: AstroConfig; server: ViteDevServer }) {
	for (const integration of config.integrations) {
		if (integration.hooks['astro:server:setup']) {
			await integration.hooks['astro:server:setup']({ server });
		}
	}
}

export async function runHookServerStart({ config, address }: { config: AstroConfig; address: AddressInfo }) {
	for (const integration of config.integrations) {
		if (integration.hooks['astro:server:start']) {
			await integration.hooks['astro:server:start']({ address });
		}
	}
}

export async function runHookServerDone({ config }: { config: AstroConfig }) {
	for (const integration of config.integrations) {
		if (integration.hooks['astro:server:done']) {
			await integration.hooks['astro:server:done']();
		}
	}
}

export async function runHookBuildStart({ config }: { config: AstroConfig }) {
	for (const integration of config.integrations) {
		if (integration.hooks['astro:build:start']) {
			await integration.hooks['astro:build:start']();
		}
	}
}

export async function runHookBuildDone({ config, pages }: { config: AstroConfig; pages: string[] }) {
	for (const integration of config.integrations) {
		if (integration.hooks['astro:build:done']) {
			await integration.hooks['astro:build:done']({ pages, dir: config.dist });
		}
	}
}
