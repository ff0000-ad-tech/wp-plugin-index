const path = require('path')

const watcher = require('./lib/watcher.js')
const injector = require('./lib/injector.js')
const minifier = require('./lib/minifier.js')
const io = require('./lib/io.js')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('wp-plugin-index')

function IndexPlugin(options) {
	// DM, scope) {
	this.scope = scope
	this.DM = DM
	this.options = options

	this.output
}

/** -- WEBPACK ----
 *
 *
 */

IndexPlugin.prototype.apply = function (compiler) {
	const pluginName = 'FAT Index Plugin'
	// on entry: prepare index watch (happens once)
	compiler.hooks.entryOption.tap(pluginName, (compilation) => {
		// init
		watcher.prepare(compiler, this.options.source.path, this.options.inlineAssets)
		// update inline-imports
		watcher.updateInlineImports()
	})

	// add index.html to watchlist
	compiler.hooks.afterCompile.tapAsync(pluginName, (compilation, callback) => {
		const indexPath = path.resolve(this.options.source.path)
		compilation.fileDependencies.add(indexPath)
		callback()
	})

	// check settings for updates (happens after each compile)
	compiler.hooks.shouldEmit.tap(pluginName, (compilation) => {
		// updates to settings may result in new inline-imports (ex: new preloader image)
		if (watcher.settingsHaveUpdate(compilation)) {
			log('SETTINGS have changed - will recompile to get the latest payload-modules')
			// refresh settings
			this.DM.adManager.applyIndexSettings(this.scope, this.DM.deploy.get())
			// update inline-imports
			watcher.updateInlineImports(compiler)
			this.prevTimestamps = new Map(compilation.fileTimestamps)
			return false
		}
		return true
	})

	// on emit: update output
	compiler.hooks.emit.tapAsync(pluginName, async (compilation, callback) => {
		// apply injections to index.html
		this.output = await injector.updateIndex(compilation, this.options.source.path, this.options.injections)
		// optionally minify the index.html
		if (this.options.output.minify) {
			log(`Minifying index html`)
			this.output = minifier(this.output)
		}
		// gaurd against watch seeing the index update as a user update
		this.prevTimestamps = new Map(compilation.fileTimestamps)
		// return to webpack flow
		callback()
	})

	// after emit: write output to index
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
