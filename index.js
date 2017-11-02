const _ = require('lodash');
const path = require('path');

const preloader = require('./lib/preloader');
const failover = require('./lib/failover');
const images = require('./lib/images');
const videos = require('./lib/videos');
const fonts = require('./lib/fonts');
const runtimeIncludes = require('./lib/runtimeIncludes');
const miscAdFolders = require('./lib/miscAdFolders');
const miscCommonFolders = require('./lib/miscCommonFolders');

const debug = require('debug');
var log = debug('copy-assets-plugin');

function CopyAssetsPlugin(deploy) {
	this.deploy = deploy;
};


CopyAssetsPlugin.prototype.apply = function(compiler) {
	var self = this;

	compiler.plugin('emit', function(compilation, callback) {
		self.settings = compilation.settings;

		var promises = [
			preloader.copy(),
			failover.copy(),
			images.copy(),
			videos.copy(),
			fonts.copy(),
			runtimeIncludes.copy(),
			miscAdFolders.copy(),
			miscCommonFolders.copy()
		];
		Promise.all(promises).then(() => {
			compilation.settings = self.settings;
			// return to webpack flow
			callback();
		});
	});
};



module.exports = CopyAssetsPlugin;