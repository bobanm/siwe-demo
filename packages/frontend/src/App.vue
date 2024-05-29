<script setup lang="ts">

import { ref, provide } from 'vue'
import { BrowserProvider } from 'ethers'

import SignInBox from './components/SignInBox.vue'
import AccountBox from './components/AccountBox.vue'
import ErrorBox from './components/ErrorBox.vue'
import FeedBox from './components/FeedBox.vue'

let provider: BrowserProvider

const isWalletInstalled = ref(false)
const isSignedIn = ref(false)
const accessToken = ref('')
const address = ref('')
const username = ref('')
const bio = ref('')

if (window.ethereum) {
    provider = new BrowserProvider(window.ethereum)
    provide('provider', provider)
    isWalletInstalled.value = true
}

</script>

<template>
    <main v-if="isWalletInstalled">
        <SignInBox v-model:isSignedIn="isSignedIn" v-model:accessToken="accessToken" v-model:address="address" v-model:username="username" v-model:bio="bio" />
        <AccountBox v-model:username="username" v-model:bio="bio" :accessToken="accessToken" :address="address" :isSignedIn="isSignedIn"/>
        <FeedBox v-if="isSignedIn" :accessToken="accessToken"/>
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
