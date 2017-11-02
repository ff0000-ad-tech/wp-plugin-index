function copy() {
	if self.assets.has_runtime_includes:
		if not os.path.exists(deploy_paths[target]['ad_js_path']):
			os.makedirs(deploy_paths[target]['ad_js_path'])

		# copy includes to deploy
		for runtime_package in self.assets.js['runtime_packages'][size['deploy_size']]:
			runtime_include = runtime_package['dependencies'][0]['path']

			if runtime_package['key'] == 'core':
				shutil.copy(
					self.paths['build_adlib_core_path'] + runtime_include,
					deploy_paths[target]['ad_js_path'] + utilities.get_full_filename(runtime_include)
				)
			elif runtime_package['key'] == 'common':
				shutil.copy(
					self.paths['build_adlib_common_path'] + runtime_include,
					deploy_paths[target]['ad_js_path'] + utilities.get_full_filename(runtime_include)
				)
			elif runtime_package['key'] == 'ad':
				shutil.copy(
					self.paths['local_build_path'] + size['build_size'] + '/' + runtime_include,
					deploy_paths[target]['ad_js_path'] + utilities.get_full_filename(runtime_include)
				)

}

module.exports = {
	copy: copy
};