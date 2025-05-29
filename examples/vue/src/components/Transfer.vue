<template>
  <div class="p-8 flex items-center justify-center bg-white">
    <div class="w-full max-w-xs mx-auto space-y-4">
      <div>
        <label for="email"
               class="flex text-sm font-medium text-gray-700">From</label>
        <div class="mt-1">
          <input type="text"
                 name="from"
                 id="from"
                 class="shadow-sm border focus:ring-indigo-500 focus:border-transparent block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                 :disabled="true"
                 placeholder="Please login"
                 :value="actor">
        </div>
      </div>

      <div>
        <label for="email"
               class="flex text-sm font-medium text-gray-700">To</label>
        <div class="mt-1">
          <input type="text"
                 name="to"
                 id="to"
                 class="shadow-sm border focus:ring-indigo-500 focus:border-transparent block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                 placeholder="e.g. token.burn"
                 v-model="to">
        </div>
      </div>
      <div>
        <label for="email"
               class="flex text-sm font-medium text-gray-700">Amount</label>
        <div class="mt-1">
          <input type="text"
                 name="amount"
                 id="amount"
                 class="shadow-sm border focus:ring-indigo-500 focus:border-transparent block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                 placeholder="e.g. 1.3"
                 v-model="amount">
        </div>
      </div>

      <div>
        <a @click="transfer"
           class="cursor-pointer whitespace-nowrap bg-purple-100 border border-transparent rounded-md py-2 px-4 inline-flex items-center justify-center text-base font-medium text-purple-600 hover:bg-purple-200">
          Transfer
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { computed, ref } from 'vue'

const user = useUserStore()
const to = ref('')
const amount = ref('')

const actor = computed(() => user.actor)

const transfer = () => {
  if (!user.actor) {
    return user.login()
  }

  user.transfer({
    to: to.value,
    amount: amount.value
  })
}

</script>