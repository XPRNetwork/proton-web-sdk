<template>
  <div class="relative bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex justify-between items-center border-b border-gray-200 py-6 md:justify-start md:space-x-10">
        <div class="hidden sm:block flex justify-start">
          <router-link to="/">
            <span class="sr-only">Proton</span>
            <img class="w-auto h-8 sm:h-10" src="@/assets/logo.svg" alt="">
          </router-link>
        </div>

        <nav class="flex space-x-4 sm:space-x-10 justify-center pr-2">
          <router-link to="/" class="text-base font-medium text-gray-500 hover:text-purple-900">
            Transfer
          </router-link>
        </nav>

        <div class="flex items-center justify-end space-x-8 md:flex-1 lg:w-0">
          <Avatar/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import Avatar from '@/components/Avatar.vue'

export default defineComponent({
  name: 'AppHeader',

  components: {
    Avatar
  }
})
</script>