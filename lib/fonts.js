const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');
const walk = require('walk');
const fontFixer = require('./font-fixer');

const debug = require('debug');
var log = debug('fonts');

function copy(settings, deploy) {
	if (deploy.compile.fonts) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		let promises = [];
		// each font
		settings.assets.fonts.forEach((font) => {
			const buildPath = path.normalize(
				`${deploy.context.build}/${deploy.paths.fonts}`
			);
			const deployPath = path.normalize(
				`${deploy.context.deploy}/${deploy.paths.fonts}`
			);
			if (!fs.existsSync(deployPath)) {
				fx.mkdirSync(deployPath);
			}
			log(` -> ${deployPath}/${font}`);

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
								// apply font fix
								fontFixer.apply(
									path.resolve(`${__dirname}/../../../${deployPath}/${font}`)
								)
								.then(() => {
									resolve();
								})
								.catch((err) => {
									log(err);
									reject();
								})
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