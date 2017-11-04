const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');

const debug = require('debug');
var log = debug('images');

function copy(settings, deploy) {
	if (deploy.compile.images) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		var promises = [];

		// each image
		settings.assets.images.forEach((image) => {
			const buildPath = path.normalize(
				`${deploy.context.build}/${deploy.paths.images}`
			);
			const deployPath = path.normalize(
				`${deploy.context.deploy}/${deploy.paths.images}`
			);
			if (!fs.existsSync(deployPath)) {
				fx.mkdirSync(deployPath);
			}
			log(` -> ${deployPath}/${image}`);

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

