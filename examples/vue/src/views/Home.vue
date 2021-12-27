<template>
  <Header/>
  <Transfer/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Header from '@/components/Header.vue';
import Transfer from '@/components/Transfer.vue';

export default defineComponent({
  name: 'Home',
  components: {
    Header,
    Transfer,
  },
});
</script>
