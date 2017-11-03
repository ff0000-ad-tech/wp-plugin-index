const fs = require('fs');
const fx = require('mkdir-recursive');
const path = require('path');
const _ = require('lodash');

const lib = {
	preloader:  require('./lib/preloader'),
	failover:  require('./lib/failover'),
	images:  require('./lib/images'),
	videos:  require('./lib/videos'),
// fonts:  require('./lib/fonts'),
// runtimeIncludes:  require('./lib/runtimeIncludes'),
// miscAdFolders:  require('./lib/miscAdFolders'),
// miscCommonFolders:  require('./lib/miscCommonFolders')
};

const debug = require('debug');
var log = debug('copy-assets-plugin');

function CopyAssetsPlugin(deploy) {
	this.deploy = deploy;
};


CopyAssetsPlugin.prototype.apply = function(compiler) {
	var self = this;

	compiler.plugin('emit', function(compilation, callback) {
		log('Preparing deploy folders');
		prepareDeploy(compilation.settings.deploy.paths);

		log('Copying assets:');
		var promises = [];
		for (var i in lib) {
			promises.push(
				lib[i].copy(compilation.settings)
			);
		}

		// return to webpack flow
		Promise.all(promises).then(() => {
			log('complete');
			compilation.settings = self.settings;
			callback();
		})
		.catch((err) => {
			log(err);
		});
	});
};

function prepareDeploy(paths) {
	if (!fs.existsSync(paths.context.deploy)) {
		fx.mkdirSync(paths.context.deploy);
	}
}

module.exports = CopyAssetsPlugin;