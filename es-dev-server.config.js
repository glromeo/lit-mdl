const path = require("path");
const util = require('util');
const sass = require("node-sass");
const sassImporter = require("node-sass-magic-importer");

const renderSass = util.promisify(sass.render);

const exportStyle = (css) => `
import {css} from "/node_modules/lit-element/lit-element.js";
export const style = css\`
${String(css)}
\`;
export default style;
`.trim();

module.exports = {
    port: 8080,
    moduleDirs: ['./node_modules', './web_modules'],
    customMiddlewares: [
        async function transpileSassToEsm(ctx, next) {
            if (ctx.url.endsWith(".scss")) {
                const {css} = await renderSass({
                    file: path.resolve(__dirname, ctx.url.substring(1)),
                    importer: sassImporter(),
                    includePaths: [
                        path.resolve(__dirname, 'node_modules')
                    ],
                    outputStyle: 'compressed',
                    sourceMapEnabled: true
                });
                ctx.body = exportStyle(css);
                ctx.type = "application/javascript";
            } else {
                return next();
            }
        }
    ],
};