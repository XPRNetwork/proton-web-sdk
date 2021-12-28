<script lang="ts">
	import logo from './logo.svg';
	import Avatar from '../Avatar.svelte'
</script>

<header>
	<div class="relative bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6">
		  <div class="flex justify-between items-center border-b border-gray-200 py-6 md:justify-start md:space-x-10">
			<div class="hidden sm:block flex justify-start">
			  <div>
				<span class="sr-only">Proton</span>
				<img class="w-auto h-8 sm:h-10" src="{logo}" alt="">
			  </div>
			</div>
	
			<nav class="flex space-x-4 sm:space-x-10 justify-center pr-2">
			  <div class="text-base font-medium text-gray-500 hover:text-purple-900">
				Transfer
			  </div>
			</nav>
	
			<div class="flex items-center justify-end space-x-8 md:flex-1 lg:w-0">
			  <Avatar/>
			</div>
		  </div>
		</div>
	</div>
</header>