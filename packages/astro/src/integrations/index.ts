import { AstroConfig, IntegrationInstructionSet, RendererConfig } from '../@types/astro.js';
import { createRequire } from 'module';

type IntegrationObject = [string, string, any];
const resolvePackage = createRequire(import.meta.url).resolve;

export async function loadIntegrations(integrations: string[]): Promise<IntegrationObject[]> {
	return await Promise.all(
		integrations.map(async (name) => {
			const resolved = resolvePackage(name);
			const imported = await import(resolved);
			return [name, resolved, imported];
		})
	);
}

export async function runIntegrations(integrations: IntegrationObject[], config?: AstroConfig): Promise<IntegrationInstructionSet[]> {
	const instructionSets: IntegrationInstructionSet[] = [];
	for (const integration of integrations) {
		const instruction: IntegrationInstructionSet = {};
		instructionSets.push(instruction);
		console.log(
			await integration[2].default({
				config,
				addRenderer: (obj: RendererConfig) => {
					instruction.addRenderer = obj;
				},
				applyConfiguration: (newConfigValues: any) => {
					instruction.applyConfiguration = newConfigValues;
				},
			})
		);
	}
	return instructionSets;
}

// TODO: A nice system that checks the integration package.json manifest,
// and confirms / asserts that all peerDependencies are installed and available
// at the correct version.
//
// If not available, shows a nice message on how to add them yourself.
// This is automatic in some package managers (ex: npm 7) but not others (ex: npm < 7).
//
// See scratch notes below for implementing this system.
// Delete all of this if ready to merge.

// import * as vite from 'vite';
// import {pkgUp} from 'pkg-up';
// import { fileURLToPath } from 'url';
// import { readFile } from 'fs/promises';
// import { AstroConfig, RendererConfig } from '../@types/astro.js';
// import { createRequire } from 'module';
// // import { ViteConfigWithSSR } from '../core/create-vite.js';
// // import { createRenderer } from './renderers.js';
// // import { resolveDependency } from '../core/util.js';
// // const pkg = await getUserPackageManifest(config);
// 	// const allDependenciesCached = [...Object.entries(pkg.dependencies), ...Object.entries(pkg.devDependencies)];
// 	// const allDependencies = new Set([...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]);

// assertDependency: (pkg: string, semver: string) => {
// 	const found = allDependenciesCached.find(([name]) => name === pkg);
// 	if (!found) {
// 		throw new Error(`NOT FOUND: ${pkg}`);
// 	}
// 	if (found[1] !== semver) {
// 		throw new Error(`NOT MATCH SEMVER ${pkg} ${found[1]} !== ${semver}`);
// 	}
// },

// async function getUserPackageManifest(config: AstroConfig) {
// 	const pkgPath = await pkgUp({ cwd: fileURLToPath(config.projectRoot) });
// 	if (!pkgPath) {
// 		return;
// 	}
// 	return JSON.parse(await readFile(pkgPath, 'utf8'));
// }
