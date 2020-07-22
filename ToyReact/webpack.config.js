module.exports = {
    entry: {
        // main: './main.js'
        // main: './day1/main.js'
        main: './day2/main.js'
        // main: './day3/main.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options:{
                        presets: ['@babel/preset-env'],
                        plugins: [[
                            "@babel/plugin-transform-react-jsx",
                            {pragma:"ToyReact.createElement"}
                        ]]
                    }
                }
            }
        ]
    },
    mode: "development",
    optimization: {
        minimize: false
    }
}