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

// const fs = require('fs');
// const { defineConfig } = require('@vue/cli-service')

// module.exports = defineConfig({
//   transpileDependencies: true,
//   devServer: {
//     webSocketServer: false,
//     server: {
//       type: 'https',
//       options: {
//         key: fs.readFileSync('./cert/server.key'), // Caminho para os certificados no Vue
//         cert: fs.readFileSync('./cert/server.cert'),
//       },
//     },
//     proxy: {
//       '/api': {
//         target: 'https://localhost:443', // Backend Node.js
//         secure: false, // Ignorar erros de certificado autoassinado
//         changeOrigin: true,
//       },
//     },
//   },
// });
