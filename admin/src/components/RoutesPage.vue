<template>
  <div>
    <h1>Editar Rotas para a Linha: {{ lineId }}</h1>
    <!-- Conteúdo da página de rotas -->
  </div>
</template>

<script>
export default {
  props: ['lineId'], // Recebe o parâmetro lineId como prop
  mounted() {
    console.log("Line ID recebido:", this.lineId); // Verificar se o parâmetro está correto
  },
};
</script>
