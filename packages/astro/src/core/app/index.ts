import type { ComponentInstance, ManifestData, RouteData, Renderer, RendererConfig } from '../../@types/astro';
import type { SSRManifest as Manifest, RouteInfo } from './types';

import { defaultLogOptions } from '../logger.js';
import { matchRoute } from '../routing/match.js';
import { render } from '../render/core.js';
import { RouteCache } from '../render/route-cache.js';
import { createLinkStylesheetElementSet, createModuleScriptElementWithSrcSet } from '../render/ssr-element.js';
import { prependForwardSlash } from '../path.js';
import { loadIntegrations, runIntegrations } from '../../integrations/index.js';

export class App {
	#manifest: Manifest;
	#manifestData: ManifestData;
	#rootFolder: URL;
	#routeDataToRouteInfo: Map<RouteData, RouteInfo>;
	#routeCache: RouteCache;
	#renderersPromise: Promise<Renderer[]>;

	constructor(manifest: Manifest, rootFolder: URL) {
		this.#manifest = manifest;
		this.#manifestData = {
			routes: manifest.routes.map((route) => route.routeData),
		};
		this.#rootFolder = rootFolder;
		this.#routeDataToRouteInfo = new Map(manifest.routes.map((route) => [route.routeData, route]));
		this.#routeCache = new RouteCache(defaultLogOptions);
		this.#renderersPromise = this.#loadRenderers();
	}
	match({ pathname }: URL): RouteData | undefined {
		return matchRoute(pathname, this.#manifestData);
	}
	async render(url: URL, routeData?: RouteData): Promise<string> {
		if (!routeData) {
			routeData = this.match(url);
			if (!routeData) {
				return 'Not found';
			}
		}

		const manifest = this.#manifest;
		const info = this.#routeDataToRouteInfo.get(routeData!)!;
		const [mod, renderers] = await Promise.all([this.#loadModule(info.file), this.#renderersPromise]);

		const links = createLinkStylesheetElementSet(info.links, manifest.site);
		const scripts = createModuleScriptElementWithSrcSet(info.scripts, manifest.site);

		return render({
			experimentalStaticBuild: true,
			links,
			logging: defaultLogOptions,
			markdownRender: manifest.markdown.render,
			mod,
			origin: url.origin,
			pathname: url.pathname,
			scripts,
			renderers,
			async resolve(specifier: string) {
				if (!(specifier in manifest.entryModules)) {
					throw new Error(`Unable to resolve [${specifier}]`);
				}
				const bundlePath = manifest.entryModules[specifier];
				return prependForwardSlash(bundlePath);
			},
			route: routeData,
			routeCache: this.#routeCache,
			site: this.#manifest.site,
		});
	}
	async #loadRenderers(): Promise<Renderer[]> {
		const rendererNames = this.#manifest.renderers;
		const loadedIntegrations = await loadIntegrations(rendererNames);
		const integrationInstructions = await runIntegrations(loadedIntegrations);
		const rendererConfigObjects = integrationInstructions.map((ins) => ins.addRenderer).filter(Boolean) as RendererConfig[];
		const renderers = await Promise.all(
			rendererConfigObjects.map(async (r) => {
				const mod = (await import(r.serverEntrypoint)) as { default: Renderer['ssr'] };
				return { ...r, ssr: mod.default };
			})
		);
		return renderers;
	}

	async #loadModule(rootRelativePath: string): Promise<ComponentInstance> {
		let modUrl = new URL(rootRelativePath, this.#rootFolder).toString();
		let mod: ComponentInstance;
		try {
			mod = await import(modUrl);
			return mod;
		} catch (err) {
			throw new Error(`Unable to import ${modUrl}. Does this file exist?`);
		}
	}
}
