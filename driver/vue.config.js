const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: "all",
    proxy: {
      "/api": {
        target: "https://localhost:3000",
        secure: false,
        changeOrigin: true,
        ws: true,
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    historyApiFallback: true,
  },
  publicPath: "/",
  pwa: {
    name: "FastBus - Driver",
    themeColor: "#1e1e1e",
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
