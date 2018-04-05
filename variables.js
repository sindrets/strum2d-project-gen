module.exports = {
  txtPackage:
`{
  "name": "%s",
  "version": "%s",
  "description": "%s",
  "main": "%s",
  "scripts": {
    "build": "echo Compiling for PRODUCTION&& echo Compiling typescript...&& tsc&& echo Bundling js...&& webpack --mode production&& echo Done!",
    "compile": "echo Compiling for DEVELOPMENT&& echo Compiling typescript...&& tsc&& echo Bundling js...&& webpack --mode development&& echo Done!"
  },
  "author": "%s",
  "license": "%s"
}`,

  txtWebpack:
`const path = require("path");
module.exports = {
  entry: './out/%s',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  externals: /(@types\\/index)|(Strum2d)/,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, "out")
  }
};`,

  txtApp:
`/// <reference path="../typings/strum-2d.d.ts" />

export class %1$s extends Strum2d.Scene {

	constructor() {
		super();
		this.visible = true;
		this.mutable = true;
		this.overlay = false;
	}
	
	/**
	 * Called every time this scene is loaded
	 */
	load(): void {}

	/**
	 * Called the first time this scene is loaded
	 */
	initScene(): void {}

	tick(): void {}

}

Strum2d.Main.requestScene(new %1$s());`
}
