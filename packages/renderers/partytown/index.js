
import { partytownSnippet } from '@builder.io/partytown/integration';
import { createRequire } from 'module';
import path from 'path';
const resolve = createRequire(import.meta.url).resolve;

/** @type { config: Readonly<AstroConfig>; assertDependency: (pkg: string, semver: string) => void; addRenderer: (mod: any | Promise<any>) => void } */
export default async function (astro) {
	const partytownSnippetHtml = partytownSnippet({
		debug: true
	});
	astro.addScriptInline('head', partytownSnippetHtml);

	const partytownEntrypoint = resolve('@builder.io/partytown/package.json');
	const partytownLibDirectory = path.resolve(partytownEntrypoint, '../lib');
	astro.includeDirectory(partytownLibDirectory, '/~partytown'); 

	// TODO: What I really want here is a hook! Then I can write my own fs stuff

}
