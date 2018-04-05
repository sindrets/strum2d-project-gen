const readline = require("readline");
const path = require("path");
const fs = require("fs");
const tar = require("tar-fs");
const variables = require("./variables.js");
const chalk = require("chalk");
const isElevated = require("is-elevated");
const sprintfJs = require("sprintf-js");
const sprintf = sprintfJs.sprintf;
const log = console.log;

const sep = (() => {
	return process.platform != "win32" ? ";" : " &&";
})();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

var isAdmin = false;
var className = "";

var txtPackage = "";
var txtWebpack = "";
var txtApp = "";

var name = "";
var version = "1.0.0";
var description = "";
var entry = "App.js";
var author = "";
var license = "MIT";

const reset = () => {
	name = "";
	version = "1.0.0";
	description = "";
	entry = "app.ts";
	author = "";
	license = "MIT";
}

const prompt = async () => {

	await new Promise((resolve, reject) => {
		rl.question(chalk.yellow(`Project name: `), (response) => {
			name = response ? response : name;
			resolve();
		});
	})
	await new Promise((resolve, reject) => {
		rl.question(chalk.yellow(`Version: (${version}) `), (response) => {
			version = response ? response : version;
			resolve();
		});
	})
	await new Promise((resolve, reject) => {
		rl.question(chalk.yellow(`Description: `), (response) => {
			description = response ? response : description;
			resolve();
		});
	})
	await new Promise((resolve, reject) => {
		rl.question(chalk.yellow(`Main: (${entry}) `), (response) => {
			entry = response ? response : entry;
			resolve();
		});
	})
	await new Promise((resolve, reject) => {
		rl.question(chalk.yellow(`License: (${license}) `), (response) => {
			license = response ? response : license;
			resolve();
		});
	})
	await new Promise((resolve, reject) => {
		rl.question(chalk.yellow(`Author: `), (response) => {
			author = response ? response : author;
			resolve();
		});
	})

	txtPackage = sprintf(variables.txtPackage, name, version, description, entry, author, license);
	log(chalk.bgMagenta("\npackage.json:"));
	log(txtPackage);

	txtWebpack = sprintf(variables.txtWebpack, entry);
	log(chalk.bgMagenta("\nwebpack.config.js:"));
	log(txtWebpack);

	className = entry.substring(0, entry.indexOf("."));
	txtApp = sprintf(variables.txtApp, className);
	log(chalk.bgMagenta("\n" + className + ":"));
	log(txtApp);

	let result = true;
	await new Promise((resolve, reject) => {
		rl.question(chalk.blue(`\nIs this ok? (yes) `), (response) => {
			let r = response.toLowerCase();
			result = (r == "" || r == "yes" || r == "y");
			resolve();
		});
	})
	log(result);

	if (!result) {
		reset();
		await prompt();
	}
	else {
		generate();
		rl.close();
	}
	
}

const extractTemplate = async ()=> {

	await new Promise((resolve, reject) => {
		fs.createReadStream(
			path.join(__dirname, "template.tar")
		).pipe(tar.extract(
			process.cwd(),
			{ finish: () => { resolve() } }
		));
	});

}

const generate = async () => {

	await extractTemplate();
	fs.writeFileSync(path.join(process.cwd(), "package.json"), txtPackage);
	fs.writeFileSync(path.join(process.cwd(), "webpack.config.js"), txtWebpack);
	fs.writeFileSync(path.join(process.cwd(), "lib/" + className + ".ts"), txtApp);

}

const main = async () => {

	await isElevated().then(elevated => {
		isAdmin = elevated;
	});
	// if (!isAdmin) {
	// 	log(chalk.yellow(
	// 		"Admin privileges not detected! \nThis project generator requires " +
	// 		"admin privileges in order to create the necessary symbolic links. "
	// 	));
	// 	rl.close();
	// 	return;
	// }

	variables.txtPackage = variables.txtPackage.replace(/&&/g, sep);

	log("dirname: " + __dirname);
	log("cwd: " + process.cwd());
	log(chalk.bgMagenta("Strum2D Project Generator"));
	log("-------------------------");
	await prompt();

}

/**
 * Synchronously copy a file to a target location.
 * @param  {string} source Path to the file to be copied
 * @param  {string} target Path to the target copy location
 */
function copyFileSync(source, target) {

	var targetFile = target;

	//if target is a directory a new file with the same name will be created
	if (fs.existsSync(target)) {
		if ( fs.lstatSync(target).isDirectory() ) {
			targetFile = path.join(target, path.basename(source));
		}
	}

	fs.writeFileSync(targetFile, fs.readFileSync(source));
}

/**
 * Synchronously and recursively copy a folder to a target location.
 * @param {string} source Path to the folder to be copied
 * @param {string} target Path to the target copy location
 */
function copyFolderRecursiveSync(source, target) {

	if (!fs.existsSync(target))
		fs.mkdirSync(target);

	var traverse = function(folder) {
		var files = fs.readdirSync(source + "/" + folder);
		files.forEach(function(file) {
			var curSource = path.join(source + folder, file);
			if (fs.lstatSync(curSource).isDirectory()) {
				fs.mkdirSync(target + "/" + folder + "/" + file);
				traverse(folder + "/" + file); // Recurse
			}
			else {
				copyFileSync(source + "/" + folder + "/" + file, target + "/" + folder + "/" + file);
			}
		});
	}
	traverse("");
}

main();

