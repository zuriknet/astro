import type { RoutePart } from 'astro';
import type { PathLike } from 'fs';

import fs from 'fs/promises';

export async function writeJson(path: PathLike, data: any) {
	await fs.writeFile(path, JSON.stringify(data), { encoding: 'utf-8' });
}

export async function emptyDir(dir: PathLike): Promise<void> {
	await fs.rm(dir, { recursive: true, force: true, maxRetries: 3 });
	await fs.mkdir(dir, { recursive: true });
}

// Copied from /home/juanm04/dev/misc/astro/packages/astro/src/core/routing/manifest/create.ts
// 2022-04-26
export function getMatchPattern(segments: RoutePart[][]) {
	return segments
		.map((segment) => {
			return segment[0].spread
				? '(?:\\/(.*?))?'
				: '\\/' +
						segment
							.map((part) => {
								if (part)
									return part.dynamic
										? '([^/]+?)'
										: part.content
												.normalize()
												.replace(/\?/g, '%3F')
												.replace(/#/g, '%23')
												.replace(/%5B/g, '[')
												.replace(/%5D/g, ']')
												.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
							})
							.join('');
		})
		.join('');
}

export function getReplacePattern(segments: RoutePart[][]) {
	let n = 0;
	let result = '';

	for (const segment of segments) {
		for (const part of segment) {
			if (part.dynamic) result += '$' + ++n;
			else result += part.content;
		}
		result += '/';
	}

	// Remove trailing slash
	result = result.slice(0, -1);

	return result;
}