<script setup lang="ts">

import { ref, inject } from 'vue'
import { BACKEND_URL } from '@/config'
import type { WalletClient } from 'viem'

const accessToken = defineModel('accessToken')
const isSignedIn = defineModel('isSignedIn')
const address = defineModel('address')
const username = defineModel('username')
const bio = defineModel('bio')

const walletClient = inject<WalletClient>('walletClient') as WalletClient

const error = ref('')
const isLoading = ref(false)

async function signInWithEthereum() {

    error.value = ''
    isLoading.value = true

    try {
        const [walletAddress] = await walletClient.getAddresses()
        if (!walletAddress) {
            error.value = 'The wallet has no accounts!'
            return
        }

        const chainId = await walletClient.getChainId()

        const encodedParams = {
            address: encodeURIComponent(walletAddress),
            chainId: encodeURIComponent(String(chainId)),
            origin: encodeURIComponent(window.location.origin),
        }

        const message = await (await fetch(`${BACKEND_URL}/message?${new URLSearchParams(encodedParams)}`)).text()

        const signature = await walletClient.signMessage({ account: walletAddress, message })

        const signInResponse = await fetch(`${BACKEND_URL}/sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, signature }),
        })

        if (!signInResponse.ok) {
            error.value = 'Sign-in failed. Please try again.'
            return
        }

        const { accessToken: token, account } = await signInResponse.json()

        address.value = account.address
        username.value = account.username
        bio.value = account.bio
        isSignedIn.value = true
        accessToken.value = token
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'An unexpected error occurred during sign-in.'
    }
    finally {
        isLoading.value = false
    }
}

function signOut() {

    address.value = ''
    username.value = ''
    bio.value = ''
    isSignedIn.value = false
    accessToken.value = ''
}

</script>

<template>

    <section id="sign-in" class="top-green">
        <img src="../images/pilot.svg" class="right zoom">
        <h2>Authentication</h2>
        <div v-if="error" class="error">{{ error }}</div>
        <button v-if="!isSignedIn" @click="signInWithEthereum" :disabled="isLoading" class="btn-green">
            {{ isLoading ? 'Signing in...' : 'Sign-In With Ethereum' }}
        </button>
        <button v-if="isSignedIn" @click="signOut" class="btn-green">Sign Out</button>
        <div v-if="isSignedIn" class="start">{{ address }}</div>
    </section>

</template>
