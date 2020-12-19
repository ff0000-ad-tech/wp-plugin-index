##### FF0000 Ad Tech

# Webpack Plugin - Index

This plugin injects settings, webpack-bundles, and modules into a target document, in our case `index.html`.

A [comment-based hook pattern](https://github.com/ff0000-ad-tech/comment-hooks) is used to control where these fragments are written.

## Usage

A sample webpack configuration looks like this:

```javascript
new IndexPlugin({
	source: {
		path: `${DM.ad.get().env.build}/${DM.ad.get().paths.ad.context}/${DM.deploy.get().source.index}`,
	},
	output: {
		path: `${DM.deploy.get().output.context}/${DM.deploy.get().output.folder}/index.html`,
		minify: !DM.deploy.get().output.debug,
	},
	injections: [
		// a "value"-type injection
		{
			hook: 'Red.Settings.ad_params',
			value: `var adParams = ${JSON.stringify(DM.ad.get().settings.ref.adParams, null, '\t')};`,
		},
		// a "bundle"-type injection, corresponds to the entry-name
		{
			hook: 'Red.Bundle.inline',
			bundle: 'inline.bundle.js',
		},
		// a "file"-type injection, can find a file-path in the document, load it, and pipe the result into the doc
		{
			hook: 'Red.Bundle.initial',
			bundle: 'initial.bundle.js',
		},
		{ scope, hook: 'Red.Require.*', file: /require\(['"`]([^\)]+)['"`]\)/ },
	],
})
```

## Injection Types

##### Value

This method pipes data known at compile time into the requested hook.

##### Bundle

This method pipes an entry/bundle from your Webpack compilation into the requested hook.

##### File

If a url/filepath has be hardwired in the webpack config, it will be injected into the specified hook.

Otherwise, this method will look in the target document for a hook of the specified name. If a file-match pattern is provided, the "required" url will be loaded and then piped back to the document. A possible implementation of this might look like:

```html
<script type="text/javascript">
	/*-- Red.Require.promise_polyfill.start --*/
	require('./node_modules/promise-polyfill/dist/polyfill.min.js')
	/*-- Red.Require.promise_polyfill.end --*/
</script>
```
