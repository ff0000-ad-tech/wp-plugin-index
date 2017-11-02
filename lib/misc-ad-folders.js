function copy() {
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

module.exports = {
	copy: copy
};