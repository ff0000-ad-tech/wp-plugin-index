const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');
const walk = require('walk');

const debug = require('debug');
var log = debug('wp-plugin-assets:fonts');

function copy(deploy) {
	if (deploy.payload.fonts) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		// prepare paths
		var buildPath, deployPath;
		if (deploy.settings.assets.fonts.length) {
			buildPath = path.normalize(
				`${deploy.env.context.build}/${deploy.env.paths.common.fonts}`
			);
			deployPath = path.normalize(
				`${deploy.env.context.deploy}/${deploy.env.paths.common.fonts}`
			);
			if (!fs.existsSync(deployPath)) {
				fx.mkdirSync(deployPath);
			}
		}

		// each font
		let promises = [];
		deploy.settings.assets.fonts.forEach((font) => {
			log(`Emitting -> ${deployPath}/${font}`);

			// fonts are potentially common among sizes: do not overwrite existing
			if (!fs.existsSync(`${deployPath}/${font}`)) {
				promises.push(
					new Promise((resolve, reject) => {
						ncp(
							`${buildPath}/${font}`,
							`${deployPath}/${font}`, 
							(err) => {
								if (err) {
									log(err);
								}
								resolve();
							}
						);
					})
				);
			}
		});
		Promise.all(promises).then(() => {
			resolve();
		});
	});
}



module.exports = {
	copy: copy
};