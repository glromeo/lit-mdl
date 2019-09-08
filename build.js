const chokidar = require("chokidar");
const {resolve, dirname, basename} = require("path");
const sass = require("node-sass");
const magicImporter = require("node-sass-magic-importer");
const fsp = require("fs").promises;

const args = require("args");
args.option("watch", "watch for changes", false);
const flags = args.parse(process.argv);

const {web_modules} = require("./package.json");

const basedir = __dirname;

console.log({
    basedir: basedir,
    flags: flags,
    web_modules: web_modules
});

async function rollup() {

    const {existsSync, mkdirSync} = require("fs");

    async function ensureExists(path) {
        if (!existsSync(path)) {
            mkdirSync(path, {recursive: true});
        }
        return path;
    }

    const rollup = require("rollup");
    const resolve = require("rollup-plugin-node-resolve");
    const commonjs = require("rollup-plugin-commonjs");

    const inputOptions = {
        input: {},
        plugins: [
            resolve(),
            commonjs()
        ]
    };

    const outputOptions = {
        format: "esm",
        dir: await ensureExists(resolve(basedir, "web_modules"))
    };

    const stubsdir = await ensureExists(resolve(outputOptions.dir, ".stubs"));

    await Promise.all(web_modules.map(web_module => {
        inputOptions.input[web_module] = resolve(stubsdir, web_module + ".js");
        return fsp.writeFile(
            inputOptions.input[web_module],
            `export * from "${web_module}";`,
            "utf-8"
        )
    }));

    const bundle = rollup.rollup(inputOptions);
    await bundle.generate(outputOptions);
    await bundle.write(outputOptions);
}

function stripIndent(count, string) {
    return string.split("\n").map(line => line.substring(count)).join("\n").trim();
}

const cssToEsm = css => stripIndent(4, `
    import {css} from "lit-html";
    export const cssResult = css\`
        ${css.replace(/`/g, "\\`")}
    \`;
    if (!cssResult.cssText) {
        throw new Error("css text is undefined, this is most likely due to an error in the sass source file.");
    }
    export default cssResult;
`);

function generateCssModule(srcFile, outFile, options) {
    sass.render({}, async function (sassError, result) {
        if (sassError) {
            console.error("error compiling sass file: " + sassError);
        } else try {
            const css = result.css.toString("utf-8");
            await fsp.writeFile(outFile, cssToEsm(css), "utf-8");
        } catch (writeError) {
            console.error("error writing css module: " + writeError);
            process.exit(1);
        }
    })
}

const scssWatcher = chokidar.watch([
    "**/*.scss"
], {
    ignored: ["**/node_modules/**/*", ".*", "**/.*"],
    cwd: basedir
}).on("all", function (event, path) {
    console.log(event, path);
    if (event === "add" || event === "change") {
        const srcFile = resolve(basedir, path);
        const outFile = resolve(dirname(srcFile), basename(srcFile, ".scss"), ".css.js");
        const options = {
            outputStyle: "compressed",
            sourceMapEnabled: true
        };
        generateCssModule(srcFile, outFile, options);
    }
});

Promise.all([
    rollup(),
    new Promise(resolve => scssWatcher.on("ready", resolve))
]).then(function () {
    console.log("compilation finished");
    if (flags.watch) {
        console.log("watching for file system changes...");
    } else {
        console.log("done.");
        scssWatcher.close();
    }
})