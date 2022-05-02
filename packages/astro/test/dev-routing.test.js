import { expect } from 'chai';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Development Routing', () => {
	describe('No site config', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({ root: './fixtures/without-site-config/' });
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('200 when loading /', async () => {
			const response = await fixture.fetch('/');
			expect(response.status).to.equal(200);
		});

		it('200 when adding search params', async () => {
			const response = await fixture.fetch('/?foo=bar');
			expect(response.status).to.equal(200);
		});

		it('200 when loading non-root page', async () => {
			const response = await fixture.fetch('/another');
			expect(response.status).to.equal(200);
		});

		it('200 when loading dynamic route', async () => {
			const response = await fixture.fetch('/1');
			expect(response.status).to.equal(200);
		});

		it('404 when loading invalid dynamic route', async () => {
			const response = await fixture.fetch('/2');
			expect(response.status).to.equal(404);
		});
	});

	describe('No subpath used', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/with-subpath-no-trailing-slash/',
				outDir: './dist-4007',
				site: 'http://example.com/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('200 when loading /', async () => {
			const response = await fixture.fetch('/');
			expect(response.status).to.equal(200);
		});

		it('200 when loading non-root page', async () => {
			const response = await fixture.fetch('/another');
			expect(response.status).to.equal(200);
		});

		it('200 when loading dynamic route', async () => {
			const response = await fixture.fetch('/1');
			expect(response.status).to.equal(200);
		});

		it('404 when loading invalid dynamic route', async () => {
			const response = await fixture.fetch('/2');
			expect(response.status).to.equal(404);
		});
	});

	describe('Subpath with trailing slash', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/with-subpath-no-trailing-slash/',
				outDir: './dist-4008',
				site: 'http://example.com',
				base: '/blog',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('200 when loading /', async () => {
			const response = await fixture.fetch('/');
			expect(response.status).to.equal(200);

			// Vite internally redirects this to the subpath root
			const url = new URL(response.url);
			expect(url.pathname).to.equal('/blog/');
		});

		it('200 when loading subpath root', async () => {
			const response = await fixture.fetch('/blog/');
			expect(response.status).to.equal(200);
		});

		it('404 when loading subpath root without trailing slash', async () => {
			const response = await fixture.fetch('/blog');
			expect(response.status).to.equal(404);
		});

		it('200 when loading another page with subpath used', async () => {
			const response = await fixture.fetch('/blog/another/');
			expect(response.status).to.equal(200);
		});

		it('200 when loading dynamic route', async () => {
			const response = await fixture.fetch('/blog/1/');
			expect(response.status).to.equal(200);
		});

		it('404 when loading invalid dynamic route', async () => {
			const response = await fixture.fetch('/blog/2/');
			expect(response.status).to.equal(404);
		});
	});

	describe('Subpath without trailing slash', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/with-subpath-no-trailing-slash/',
				base: '/blog',
				outDir: './dist-4009',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('200 when loading /', async () => {
			const response = await fixture.fetch('/');
			expect(response.status).to.equal(200);

			// Vite internally redirects this to the subpath root
			const url = new URL(response.url);
			expect(url.pathname).to.equal('/blog/');
		});

		it('200 when loading subpath root with trailing slash', async () => {
			const response = await fixture.fetch('/blog/');
			expect(response.status).to.equal(200);
		});

		it('404 when loading subpath root without trailing slash', async () => {
			const response = await fixture.fetch('/blog');
			expect(response.status).to.equal(404);
		});

		it('200 when loading another page with subpath used', async () => {
			const response = await fixture.fetch('/blog/another/');
			expect(response.status).to.equal(200);
		});

		it('200 when loading dynamic route', async () => {
			const response = await fixture.fetch('/blog/1/');
			expect(response.status).to.equal(200);
		});

		it('404 when loading invalid dynamic route', async () => {
			const response = await fixture.fetch('/blog/2/');
			expect(response.status).to.equal(404);
		});
	});

	describe('Endpoint routes', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/with-endpoint-routes/',
				site: 'http://example.com/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('200 when loading /home.json', async () => {
			const response = await fixture.fetch('/home.json');
			expect(response.status).to.equal(200);

			const body = await response.text().then((text) => JSON.parse(text));
			expect(body.title).to.equal('home');
		});

		it('200 when loading /thing1.json', async () => {
			const response = await fixture.fetch('/thing1.json');
			expect(response.status).to.equal(200);

			const body = await response.text().then((text) => JSON.parse(text));
			expect(body.slug).to.equal('thing1');
			expect(body.title).to.equal('[slug]');
		});

		it('200 when loading /thing2.json', async () => {
			const response = await fixture.fetch('/thing2.json');
			expect(response.status).to.equal(200);

			const body = await response.text().then((text) => JSON.parse(text));
			expect(body.slug).to.equal('thing2');
			expect(body.title).to.equal('[slug]');
		});

		it('200 when loading /data/thing3.json', async () => {
			const response = await fixture.fetch('/data/thing3.json');
			expect(response.status).to.equal(200);

			const body = await response.text().then((text) => JSON.parse(text));
			expect(body.slug).to.equal('thing3');
			expect(body.title).to.equal('data [slug]');
		});

		it('200 when loading /data/thing4.json', async () => {
			const response = await fixture.fetch('/data/thing4.json');
			expect(response.status).to.equal(200);

			const body = await response.text().then((text) => JSON.parse(text));
			expect(body.slug).to.equal('thing4');
			expect(body.title).to.equal('data [slug]');
		});
	});
});
