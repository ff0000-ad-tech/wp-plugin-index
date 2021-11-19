const fs = require('fs')
const path = require('path')
const varname = require('varname')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('wp-plugin-index:importer')

/* -- INLINE IMPORTS -----------------------------
 *
 *
 */
const updateInlineImports = (entryPaths, sources) => {
	log('Updating inline-imports')
	let imports = `import { InlineSrc } from '@ff0000-ad-tech/ad-assets'\n` + `window.InlineSrc = InlineSrc\n\n`
	// build preloader-image imports
	sources.forEach((assetPath) => {
		imports += buildInlineImports(assetPath)
	})
	// write payload entry target, webpack will notice and compile asset as base64
	if (entryPaths) {
		entryPaths.forEach((entryPath) => writeEntry(entryPath, imports))
	}
}

const buildInlineImports = (assetPath) => {
	const assetName = varname.camelback(path.basename(assetPath).split('.')[0])
	return `import ${assetName} from '${assetPath}?inline=true'\n` + `InlineSrc.add('${assetPath}', ${assetName})\n`
}

const writeEntry = (path, contents) => {
	log(' writing entry:', path)
	try {
		fs.writeFileSync(path, contents)
	} catch (err) {
		log(err)
	}
}

module.exports = {
	updateInlineImports
}
