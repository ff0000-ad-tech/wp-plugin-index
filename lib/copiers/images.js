const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');

const debug = require('debug');
var log = debug('wp-plugin-assets:images');

function copy(deploy) {
	if (deploy.payload.images) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		// prepare paths
		var buildPath, deployPath;
		if (deploy.settings.assets.images.length) {
			buildPath = path.normalize(
				`${deploy.env.context.build}/${deploy.env.paths.ad.images}`
			);
			deployPath = path.normalize(
				`${deploy.env.context.deploy}/${deploy.env.paths.ad.images}`
			);
			if (!fs.existsSync(deployPath)) {
				fx.mkdirSync(deployPath);
			}
		}

		// each image
		var promises = [];
		deploy.settings.assets.images.forEach((image) => {
			log(`Emitting -> ${deployPath}/${image}`);

			promises.push(
				new Promise((resolve, reject) => {
					ncp(`${buildPath}/${image}`, 
						`${deployPath}/${image}`, (err) => {
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

