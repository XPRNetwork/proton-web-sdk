<script lang="ts">
    import { transfer, actor } from "$lib/userState";
    
    let to = "";
    let amount = "";
    </script>
    
    <div class="p-8 flex items-center justify-center bg-white">
        <div class="w-full max-w-xs mx-auto space-y-4">
          <div>
            <label for="email" class="flex text-sm font-medium text-gray-700">From</label>
            <div class="mt-1">
              <input
                type="text"
                name="from"
                id="from"
                class="shadow-sm border focus:ring focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 outline-none"
                disabled={true}
                placeholder="Please login"
                value={$actor}
              >
            </div>
          </div>
    
          <div>
            <label for="email" class="flex text-sm font-medium text-gray-700">To</label>
            <div class="mt-1">
              <input
                type="text"
                name="to"
                id="to"
                class="shadow-sm border focus:ring focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 outline-none"
                placeholder="e.g. token.burn"
                bind:value={to}
              >
            </div>
          </div>
          <div>
            <label for="email" class="flex text-sm font-medium text-gray-700">Amount</label>
            <div class="mt-1">
              <input
                type="text"
                name="amount"
                id="amount"
                class="shadow-sm border focus:ring focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 outline-none"
                placeholder="e.g. 1.3"
                bind:value={amount}
              >
            </div>
          </div>
    
          <div class="flex justify-center">
            <div
              class="cursor-pointer whitespace-nowrap bg-purple-100 border border-transparent rounded-md py-2 px-4 inline-flex items-center justify-center text-base font-medium text-purple-600 hover:bg-purple-200"
              onclick={() => transfer({ to, amount })}
            >
              Transfer
            </div>
          </div>
        </div>
      </div>