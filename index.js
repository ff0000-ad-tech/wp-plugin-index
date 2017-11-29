const fs = require('fs');
const path = require('path');

const hooksRegex = require('hooks-regex');


const debug = require('debug');
var log = debug('wp-plugin-index');


function IndexPlugin(DM, options) {
	this.DM = DM;
	this.options = options;

	this.updates = [
		adParams,
		assets,
		environments,
		inline,
		initial
	];
}




IndexPlugin.prototype.apply = function (compiler) {
	const self = this;

	compiler.plugin('emit', (compilation, callback) => {
		// load index
		var source = loadSource(this.options.source.path);

		// apply all updates
		source = self.updates.reduce((source, update) => {
			return update(self.DM, source, compilation);
		}, source);
		
		// write output
		log(`Emitting -> ${this.options.output.path}`);
		writeOutput(this.options.output.path, source);

		callback();
	});
};




function adParams(DM, source) {
	log('Updating adParams');
	source = source.replace(
		hooksRegex.get('Red', 'Settings', 'ad_params'),
		`var adParams = ${JSON.stringify(DM.ad.get().settings.res.adParams, null, '\t')};`
	);
	return source;
}

function assets(DM, source) {
	log('Updating assets');
	source = source.replace(
		hooksRegex.get('Red', 'Settings', 'assets'),
		`var assets = ${JSON.stringify(DM.ad.get().settings.res.assets, null, '\t')};`
	);
	return source;
}

function environments(DM, source) {
	log('Updating environments');
	source = source.replace(
		hooksRegex.get('Red', 'Settings', 'environments'),
		`var environments = ${JSON.stringify(DM.ad.get().settings.res.environments, null, '\t')};`
	);
	return source;
}
function inline(DM, source, compilation) {
	log('Updating inline');
	source = source.replace(
		hooksRegex.get('Red', 'Component', 'inline_entry'),
		compilation.assets['inline.bundle.js'].source()
	);
	return source;
}
function initial(DM, source, compilation) {
	log('Updating initial');
	source = source.replace(
		hooksRegex.get('Red', 'Component', 'initial_entry'),
		compilation.assets['initial.bundle.js'].source()
	);
	return source;
}



function loadSource(path) {
	return fs.readFileSync(path, 'utf8');
}
function writeOutput(path, source) {
	fs.writeFileSync(path, source);
}


module.exports = IndexPlugin;