module.exports = {
    plugins: [
        {
            name: '@electron-forge/plugin-vite',
            config: {
                // `build` can specify multiple entry builds, which can be
                // Main process, Preload scripts, Worker process, etc.
                build: [
                    {
                        // `entry` is an alias for `build.lib.entry`
                        // in the corresponding file of `config`.
                        entry: 'src/main.js',
                        config: 'vite.main.config.mjs'
                    },
                    {
                        entry: 'src/preload.js',
                        config: 'vite.preload.config.mjs'
                    }
                ],
                renderer: [
                    {
                        name: 'main_window',
                        config: 'vite.renderer.config.mjs'
                    }
                ]
            }
        }
    ]
};