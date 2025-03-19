const webpack = require('webpack');

module.exports = function override(config, env) {
    // Add fallbacks for node.js core modules
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "fs": false,
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "util": require.resolve("util/")
    };

    // Add buffer plugin
    config.plugins.push(
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    );

    // Add process plugin
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
        })
    );

    return config;
};
