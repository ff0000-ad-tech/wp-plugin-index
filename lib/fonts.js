function copy() {
	if not self.html_deploy_profile.compile_fonts:
		if not os.path.exists(deploy_paths[target]['fonts_path']):
			os.makedirs(deploy_paths[target]['fonts_path'])

		# fonts are assumed to be common to all sizes, although assets maintain them per size. Hence the following:
		for deploy_size in self.assets.assets:
			for font_request in self.assets.get_fonts(deploy_size):
				source_font_path = self.paths['local_build_path'] + model.html_redlib_folder_name + '/common/fonts/' + font_request
				target_font_path = deploy_paths[target]['fonts_path'] + font_request
				if os.path.exists(source_font_path) and not os.path.exists(target_font_path):
					shutil.copy(
						source_font_path,
						target_font_path
					)
					# apply IE fix
					shell.allow_font_embed(
						self.ad_app_state,
						target_font_path 
					)
}

function applyFontFix(path) {
	for font_request in os.listdir(path):
		# recurse
		if os.path.isdir(path + font_request):
			self.apply_font_fix(
				path + font_request + '/' 
			)

		# not invisible
		elif re.search('^\.', font_request) == None:
			shell.allow_font_embed(
				self.ad_app_state, 
				path
			)

}

module.exports = {
	copy: copy
};