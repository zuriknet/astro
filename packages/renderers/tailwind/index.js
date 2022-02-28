

/** @type { config: Readonly<AstroConfig>; assertDependency: (pkg: string, semver: string) => void; addRenderer: (mod: any | Promise<any>) => void } */
export default async function (astro) {
	// astro.applyConfiguration({
	// 	optimizeDeps: {
	// 		exclude: ['@astrojs/tailwind/base.css'],
	// 	},
	// });
	astro.addStyle('@astrojs/tailwind/base.css');

}
