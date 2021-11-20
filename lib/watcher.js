const importer = require('./importer.js')

const debug = require('@ff0000-ad-tech/debug')
const log = debug('wp-plugin-index:watcher')

let indexPath, startTime, prevTimestamps
let compiler, inlineAssets
// preparePayload
const prepare = (_compiler, _indexPath, _inlineAssets) => {
	log('Preparing index watcher')
	indexPath = _indexPath
	startTime = Date.now()
	prevTimestamps = new Map()
	compiler = _compiler
	inlineAssets = _inlineAssets
}

const setPrevTimestamps = (fileTimestamps) => {
	prevTimestamps = fileTimestamps
}

const updateInlineImports = () => {
	const entryPaths = compiler.options.entry[inlineAssets.entry].import
	const sources = inlineAssets.sources()
	importer.updateInlineImports(entryPaths, sources)
}

const settingsHaveUpdate = (compilation) => {
	log(`Checking if settings have update`)
	log(`TODO: Needs migration to Webpack 5~`)
	for (var watchFile of compilation.fileTimestamps.keys()) {
		if (hasUpdate(compilation, watchFile, indexPath)) {
			log(`Change detected: ${indexPath}`)
			return true
		}
	}
}
const hasUpdate = (compilation, watchFile, requestFile) => {
	if (watchFile === requestFile) {
		const prevTimestamp = prevTimestamps.get(watchFile) || startTime
		const fileTimestamp = compilation.fileTimestamps.get(watchFile) || Infinity
		if (prevTimestamp < fileTimestamp) {
			return true
		}
	}
}

module.exports = {
	prepare,
	setPrevTimestamps,
	updateInlineImports,
	settingsHaveUpdate
}
