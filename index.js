const fs = require('fs')
const path = require('path')

const hooksRegex = require('hooks-regex')

const debug = require('debug')
const promisePolyfillPath = './node_modules/promise-polyfill/dist/polyfill.min.js'
var log = debug('wp-plugin-index')

function IndexPlugin(DM, options) {
	this.DM = DM
	this.options = options

	this.updates = [adParams, assets, environments, promisePolyfill, inline, initial]
}

/** -- WEBPACK ----
 *
 *
 */
IndexPlugin.prototype.apply = function(compiler) {
	const self = this

	compiler.plugin('emit', (compilation, callback) => {
		// load index
		var source = loadSource(this.options.source.path)

		// apply all updates
		source = self.updates.reduce((source, update) => {
			return update(self.DM, source, compilation)
		}, source)

		// write output
		log(`Emitting -> ${this.options.output.path}`)
		log(this.DM.ad.get().settings.ref)
		writeOutput(this.options.output.path, source)

		callback()
	})
}

/** -- IO ----
 *
 *
 */
function loadSource(path) {
	return fs.readFileSync(path, 'utf8')
}
function writeOutput(path, source) {
	fs.writeFileSync(path, source)
}

/** -- UPDATERS ----
 *
 *
 */
function adParams(DM, source) {
	log('Updating adParams')
	source = source.replace(
		hooksRegex.get('Red', 'Settings', 'ad_params'),
		`var adParams = ${JSON.stringify(DM.ad.get().settings.ref.adParams, null, '\t')};`
	)
	return source
}

function assets(DM, source) {
	log('Updating assets')
	source = source.replace(
		hooksRegex.get('Red', 'Settings', 'assets'),
		`var assets = ${JSON.stringify(DM.ad.get().settings.ref.assets, null, '\t')};`
	)
	return source
}

function environments(DM, source) {
	log('Updating environments')
	source = source.replace(
		hooksRegex.get('Red', 'Settings', 'environments'),
		`var environments = ${JSON.stringify(DM.ad.get().settings.ref.environments, null, '\t')};`
	)
	return source
}

function promisePolyfill(DM, source) {
	log('Add Promise polyfill')
	source = source.replace(hooksRegex.get('Red', 'Component', 'promise_polyfill'), loadSource(promisePolyfillPath))
	return source
}

function inline(DM, source, compilation) {
	log('Updating inline')
	source = source.replace(hooksRegex.get('Red', 'Component', 'inline_entry'), compilation.assets['inline.bundle.js'].source())
	return source
}
function initial(DM, source, compilation) {
	log('Updating initial')
	source = source.replace(hooksRegex.get('Red', 'Component', 'initial_entry'), compilation.assets['initial.bundle.js'].source())
	return source
}

module.exports = IndexPlugin
