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
    historyApiFallback: true,
  },
  publicPath: "/",
});
