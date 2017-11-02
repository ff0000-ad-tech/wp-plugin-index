function copy() {
	for item_name in os.listdir(self.paths['local_build_path'] + model.html_redlib_folder_name + '/common/'):
		item_path = self.paths['local_build_path'] + model.html_redlib_folder_name + '/common/' + item_name
		if os.path.isdir(item_path):

			# check if item path has items
			source_is_empty = True
			for folder_item in os.listdir(item_path):
				if re.search('^\.', folder_item) == None:
					source_is_empty = False

			# list of folders to exclude
			if not source_is_empty and not item_name in ['fonts', 'js']:
				if not os.path.exists(deploy_paths[target]['common_path']):
					os.makedirs(deploy_paths[target]['common_path'])

				if not os.path.exists(deploy_paths[target]['common_path'] + item_name):
					shutil.copytree(
						self.paths['local_build_path'] + model.html_redlib_folder_name + '/common/' + item_name,
						deploy_paths[target]['common_path'] + item_name
					)
					# if folder name has "font" in it, assume the directory is fonts and apply IE fix
					if re.search(r'font', item_name):
						self.apply_font_fix(
							deploy_paths[target]['common_path'] + item_name + '/' 
						)
}

module.exports = {
	copy: copy
};