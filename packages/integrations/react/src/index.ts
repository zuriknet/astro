import { AstroIntegration } from 'astro';

function getRenderer({hasClientEntrypoint}: {hasClientEntrypoint: boolean}) {
	return {
		name: '@astrojs/react',
		clientEntrypoint: hasClientEntrypoint ? '@astrojs/react/client.js' : '@astrojs/react/client-v17.js',
		serverEntrypoint: '@astrojs/react/server.js',
		jsxImportSource: 'react',
		jsxTransformOptions: async () => {
			const {
				default: { default: jsx },
				// @ts-expect-error types not found
			} = await import('@babel/plugin-transform-react-jsx');
			return {
				plugins: [
					jsx(
						{},
						{
							runtime: 'automatic',
							importSource: '@astrojs/react',
						}
					),
				],
			};
		},
	};
}

function getViteConfiguration() {
	return {
		optimizeDeps: {
			include: ['@astrojs/react/client.js', 'react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom'],
			exclude: ['@astrojs/react/server.js'],
		},
		resolve: {
			dedupe: ['react', 'react-dom'],
		},
		ssr: {
			external: ['react-dom/server.js'],
		},
	};
}

export default function (): AstroIntegration {
	return {
		name: '@astrojs/react',
		hooks: {
			'astro:config:setup': async ({ addRenderer, updateConfig }) => {
				const hasClientEntrypoint = await (import('react-dom/client.js').then(() => true).catch(() => false));
				addRenderer(getRenderer({hasClientEntrypoint}));
				updateConfig({ vite: getViteConfiguration() });
			},
		},
	};
}
