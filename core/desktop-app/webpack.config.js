module.exports = {
    resolve: {
        fallback: {
            "fs": false,
            "path": require.resolve("path-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/"),
            "util": require.resolve("util/")
        }
    },
    externals: {
        electron: 'commonjs electron'
    },
    node: {
        __dirname: false,
        __filename: false
    },
    watchOptions: {
        ignored: [
            "C:/DumpStack.log.tmp",
            "C:/hiberfil.sys",
            "C:/pagefile.sys",
            "C:/swapfile.sys"
        ]
    }
};
