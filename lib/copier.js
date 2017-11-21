const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');
const mkdirp = require('mkdirp');

const debug = require('debug');
var log = debug('wp-plugin-assets:copier');

function copy(deploy, asset) {
	return new Promise((resolve, reject) => {
		// each source
		var promises = [];
		asset.sources.forEach((source) => {
			// prepare target folder
			const targetPath = path.normalize(`${asset.deployPath}/${source}`);
			if (!fs.existsSync(path.dirname(targetPath))) {
				mkdirp.sync(path.dirname(targetPath));
			}

			// copy
			log(`Emitting -> ${targetPath}`);
			promises.push(
				new Promise((resolve, reject) => {
					ncp(
						path.normalize(`${asset.buildPath}/${source}`), 
						targetPath, (err) => {
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