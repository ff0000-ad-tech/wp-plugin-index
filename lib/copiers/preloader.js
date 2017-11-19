const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');

const debug = require('debug');
var log = debug('wp-plugin-assets:preloader');

function copy(deploy) {
	return new Promise((resolve, reject) => {
		// prepare paths
		var buildPath, deployPath;
		if (deploy.settings.assets.preloader.images.length) {
			buildPath = path.normalize(
				`${deploy.context.build}/${deploy.paths.ad.images}`
			);
			deployPath = path.normalize(
				`${deploy.context.deploy}/${deploy.paths.ad.images}`
			);
			if (!fs.existsSync(deployPath)) {
				fx.mkdirSync(deployPath);
			}
		}

		// each preloader image
		var promises = [];
		deploy.settings.assets.preloader.images.forEach((image) => {
			log(`Emitting -> ${deployPath}/${image.source}`);

			promises.push(
				new Promise((resolve, reject) => {
					ncp(`${buildPath}/${image.source}`, 
						`${deployPath}/${image.source}`, (err) => {
						if (err) {
							log(err);
						}
						resolve();
					});
				})
			);
		});
		Promise.all(promises).then(() => {
			resolve();
		});
	});
}

module.exports = {
	copy: copy
};