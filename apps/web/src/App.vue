<script setup lang="ts">

import { provide } from 'vue'
import { createWalletClient, custom, type WalletClient } from 'viem'

import SignInBox from './components/SignInBox.vue'
import AccountBox from './components/AccountBox.vue'
import ErrorBox from './components/ErrorBox.vue'
import FeedBox from './components/FeedBox.vue'
import { useUserState } from './composables/useUserState'

let walletClient: WalletClient

const userState = useUserState()

if (window.ethereum) {
    walletClient = createWalletClient({ transport: custom(window.ethereum) })
    provide('walletClient', walletClient)
    provide('userState', userState)
}

</script>

<template>
    <main v-if="walletClient">
        <SignInBox />
        <AccountBox />
        <FeedBox v-if="userState.isSignedIn.value" />
    </main>
    <main v-else>
        <ErrorBox/>
    </main>

    <footer>
        <a href="https://boban.ninja/"><img src="./images/house.svg" class="zoom"></a>
        <a href="https://github.com/bobanm/siwe-demo/" target="_blank" rel="noopener noreferrer"><img src="./images/github.svg" class="zoom"></a>
    </footer>
</template>

<style>
@import './custom.css';
</style>
