const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: "all",
    webSocketServer: false,
    proxy: {
      "/api": {
        target: "https://localhost:3000",
        secure: false,
        changeOrigin: true,
        ws: true,
      },
      "/manifest.json": {
        target: "http://localhost:8080",
        changeOrigin: true,
        pathRewrite: { "^/manifest.json": "/manifest.json?ngrok-skip-browser-warning: true" },
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "ngrok-skip-browser-warning": "true",
    },
    historyApiFallback: true,
  },
  publicPath: "/",
  pwa: {
    manifestPath: "/manifest.json"
  },
  pwa: {
    name: "FastBus - User",
    themeColor: "#4DBA87",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
    msTileColor: "#000000",
    workboxPluginMode: "GenerateSW",
    workboxOptions: {
      runtimeCaching: [
        {
          urlPattern: new RegExp("^https://"),
          handler: "NetworkFirst",
          options: {
            cacheName: "https-cache",
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
            networkTimeoutSeconds: 10,
          },
        },
      ],
      skipWaiting: true,
      clientsClaim: true,
    },
  },
});
