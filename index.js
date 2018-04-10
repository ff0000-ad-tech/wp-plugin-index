const fs = require('fs')
const path = require('path')

const hooksRegex = require('@ff0000-ad-tech/hooks-regex')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('wp-plugin-index')

const defaultOptions = {
	inject: {}
}

function IndexPlugin(DM, options) {
	this.DM = DM
	this.options = Object.assign(defaultOptions, options)

	this.updates = [adParams, assets, environments, inline, initial]
	this.output
}

/** -- WEBPACK ----
 *
 *
 */
IndexPlugin.prototype.apply = function(compiler) {
	const self = this

	// add index.html to watchlist
	compiler.plugin('after-compile', (compilation, callback) => {
		const indexPath = path.resolve(self.options.source.path)
		compilation.fileDependencies.push(indexPath)
		callback()
	})

	// inject & update index
	compiler.plugin('emit', (compilation, callback) => {
		// load index
		this.output = loadSource(this.options.source.path)

		// apply injections
		Object.keys(self.options.inject).forEach(name => {
			const path = self.options.inject[name]
			this.output = inject(name, path, this.output)
		})

		// apply all updates
		this.output = self.updates.reduce((output, update) => {
			return update(self.DM, output, compilation)
		}, this.output)

		callback()
	})

	// write index
	compiler.plugin('after-emit', (compilation, callback) => {
		log(`Emitting -> ${this.options.output.path}`)
		log(this.DM.ad.get().settings.ref)
		writeOutput(this.options.output.path, this.output)
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

/** -- Inject ----
 *
 *
 */
function inject(name, path, source) {
	log(`Injecting - ${name}`)
	const content = loadSource(path)
	source = source.replace(hooksRegex.get('Red', 'Inject', name), () => content)
	return source
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

// passing in function as 2nd argument to prevent default "$n" escaping
function inline(DM, source, compilation) {
	log('Updating inline')
	source = source.replace(hooksRegex.get('Red', 'Inject', 'inline_entry'), () => compilation.assets['inline.bundle.js'].source())
	return source
}

function initial(DM, source, compilation) {
	log('Updating initial')
	source = source.replace(hooksRegex.get('Red', 'Inject', 'initial_entry'), () => compilation.assets['initial.bundle.js'].source())
	return source
}

module.exports = IndexPlugin
