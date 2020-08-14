var path = require('path');
var webpack = require('webpack');
module.exports = {
    entry: {
        main: './src/index.js',
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".js"]
    },
    output: {
        publicPath: "/dist",
        path: path.join(__dirname, '/wwwroot/js/'),
        filename: '[name].build.js'
    }
};