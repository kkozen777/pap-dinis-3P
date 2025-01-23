const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // https: true, // Ativar HTTPS para o dev server do Vue

    webSocketServer: false,
      proxy: {
        "/api": {
          target: "https://localhost:3000",
          secure: false, // Ignora erros de certificados autoassinados
        },
      },
    },
})