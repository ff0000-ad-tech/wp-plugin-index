const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');

const debug = require('debug');
var log = debug('wp-plugin-assets:failover');

function copy(deploy) {
	return new Promise((resolve, reject) => {
		// prepare paths
		var buildPath, deployPath;
		if (deploy.settings.assets.failover.images.length) {
			buildPath = path.normalize(
				`${deploy.env.context.build}/${deploy.env.paths.run.ad}`
			);
			deployPath = path.normalize(
				`${deploy.env.context.deploy}/${deploy.env.paths.run.ad}`
			);
			if (!fs.existsSync(deployPath)) {
				fx.mkdirSync(deployPath);
			}
		}

		// each failover image
		var promises = [];
		deploy.settings.assets.failover.images.forEach((image) => {
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

