##### 160over90 - FF0000 Ad Tech

# Webpack Plugin - Index

This plugin serves a number of purposes, all relating to the `index.html`:

1. Watches `index.html` for changes.
2. Processes settings on `window.adParams` and `window.assets`.
   - Generates `@size/.inline-imports.js` as our webpack `inline` compile entry. This is usually just the `assets.preloaders` assets.
3. Injects code into `index.html`, see [Injection Types](#injection-types):
   - Values, like updated settings, as a result of:
     - Creative Server settings.
     - Assets discovered in the compile process.
   - Webpack Bundles, like:
     - Inline
     - Initial
     - Build
   - Files, like external scripts.
4. Minifies `index.html`.

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

<a name="injection-types"></a>

##### Value

This method pipes data known at compile time into the requested hook.

##### Bundle

This method pipes an entry/bundle from your Webpack compilation into the requested hook.

##### File

If a url/filepath has be hardwired in the webpack config, it will be injected into the specified hook.

Otherwise, this method will look in the target document for a hook of the specified name. If a file-match pattern is provided, the "required" url will be loaded and then piped back to the document. A possible implementation of this might look like:

![Require Example](https://github.com/ff0000-ad-tech/wp-plugin-index/tree/master/docs/images/require-example.png)
