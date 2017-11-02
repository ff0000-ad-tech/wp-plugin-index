const _ = require('lodash');
const path = require('path');

const debug = require('debug');
var log = debug('copy-assets-plugin');

function CopyAssetsPlugin(deploy) {
	this.deploy = deploy;
};


CopyAssetsPlugin.prototype.apply = function(compiler) {
	var self = this;

	compiler.plugin('emit', function(compilation, callback) {
		log(compilation.settings);

		var promises = [
			images(),
			preloader(),
			failover(),
			videos(),
			runtimeIncludes(),
			miscAdFolders(),
		]



	function utilizedImages() {
		if not self.html_deploy_profile.compile_images:
			for image_request in self.assets.get_images(size['deploy_size']):
				destination_path = os.path.dirname(deploy_paths[target]['images_path'] + image_request)
				if not os.path.exists(destination_path):
					os.makedirs(destination_path)

				shutil.copy(
					self.paths['local_build_path'] + size['build_size'] + '/images/' + image_request,
					deploy_paths[target]['images_path'] + image_request
				)
	}

	function preloader() {
		# preloader
		for image_request in self.assets.get_preloader_images(size['deploy_size']):
			destination_path = os.path.dirname(deploy_paths[target]['images_path'] + image_request)
			if not os.path.exists(destination_path):
				os.makedirs(destination_path)

			shutil.copy(
				self.paths['local_build_path'] + size['build_size'] + '/images/' + image_request,
				deploy_paths[target]['images_path'] + image_request
			)
	}

	function videos() {
		# videos
		if os.path.exists(self.paths['local_build_path'] + size['build_size'] + '/videos'):
			if len(os.listdir(self.paths['local_build_path'] + size['build_size'] + '/videos/')):
				copy_tree(
					self.paths['local_build_path'] + size['build_size'] + '/videos',
					deploy_paths[target]['videos_path']
				)
				# append ".js" to .fbv in order to upload to strict platforms
				for item_name in os.listdir(deploy_paths[target]['videos_path']):
					new_item_name = None
					if re.search(r'\.mpg$', item_name):
						new_item_name = re.sub(r'(\.mpg$)', '\g<1>.js', item_name)
					if new_item_name:
						os.rename(
							deploy_paths[target]['videos_path'] + item_name, 
							deploy_paths[target]['videos_path'] + new_item_name
						)
	}

	function runtimeIncludes() {
		# runtime-includes
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


	function miscAdFolders() {
		# misc user-created ad folders
		for item_name in os.listdir(self.paths['local_build_path'] + size['build_size'] + '/'):
			if os.path.isdir(self.paths['local_build_path'] + size['build_size'] + '/' + item_name):
				# list of folders to exclude
				if not item_name in ['images', 'js', 'videos', 'platform']:
					if not os.path.exists(deploy_paths[target]['ad_path'] + item_name):
						shutil.copytree(
							self.paths['local_build_path'] + size['build_size'] + '/' + item_name,
							deploy_paths[target]['ad_path'] + item_name
						)
						# if folder name has "font" in it, assume the directory is fonts and apply IE fix
						if re.search(r'font', item_name):
							for font_request in os.listdir(deploy_paths[target]['ad_path'] + item_name + '/'):
								utilities.allow_font_embed(
									deploy_paths[target]['ad_path'] + item_name + '/' + font_request 
								)
	}

		// return to webpack flow
		callback();
	});
};



module.exports = CopyAssetsPlugin;