const path = require('path')

const io = require('./lib/io.js')
const injector = require('./lib/injector.js')
const minifier = require('./lib/minifier.js')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('wp-plugin-index')

function IndexPlugin(options) {
	this.options = Object.assign({}, options)
	this.output
}

/** -- WEBPACK ----
 *
 *
 */

IndexPlugin.prototype.apply = function (compiler) {
	const pluginName = 'FAT Index Plugin'

	// add index.html to watchlist
	compiler.hooks.afterCompile.tapAsync(pluginName, (compilation, callback) => {
		const indexPath = path.resolve(this.options.source.path)
		compilation.fileDependencies.add(indexPath)
		callback()
	})

	// inject & update index
	compiler.hooks.emit.tapAsync(pluginName, async (compilation, callback) => {
		try {
			// load index
			const source = await io.loadSource(this.options.source.path)

			// apply requested injections
			this.output = await this.options.injections.reduce(async (acc, injection) => {
				const source = await acc
				const injectorFunc = injector.getInjectorFunc(injection)
				return injectorFunc({
					compilation,
					source,
					...injection
				})
			}, Promise.resolve(source))

			// optionally minify the index.html
			if (this.options.output.minify) {
				log(`Minifying index html`)
				this.output = minifier(this.output)
			}
		} catch (err) {
			log(err)
		}
		callback()
	})

	// write index
	compiler.hooks.afterEmit.tapAsync(pluginName, (compilation, callback) => {
		log(`Emitting -> ${this.options.output.path}`)
		if (this.DM) {
			log(this.DM.ad.get().settings.ref)
		}
		io.writeOutput(this.options.output.path, this.output)
		callback()
	})
}

module.exports = IndexPlugin
