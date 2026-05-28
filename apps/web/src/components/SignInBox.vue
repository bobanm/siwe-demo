<script setup lang="ts">

import { ref, inject } from 'vue'
import { BACKEND_URL } from '@/config'
import type { WalletClient } from 'viem'
import type { UserState } from '@/composables/useUserState'

const walletClient = inject<WalletClient>('walletClient')!
const userState = inject<UserState>('userState')!

const error = ref('')
const isLoading = ref(false)

async function signInWithEthereum() {

    error.value = ''
    isLoading.value = true

    try {
        const [walletAddress] = await walletClient.requestAddresses()
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

        userState.address.value = account.address
        userState.username.value = account.username
        userState.bio.value = account.bio
        userState.isSignedIn.value = true
        userState.accessToken.value = token
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'An unexpected error occurred during sign-in.'
    }
    finally {
        isLoading.value = false
    }
}

function signOut() {

    userState.address.value = ''
    userState.username.value = ''
    userState.bio.value = ''
    userState.isSignedIn.value = false
    userState.accessToken.value = ''
}

</script>

<template>

    <section id="sign-in" class="top-green">
        <img src="../images/pilot.svg" class="right zoom">
        <h2>Authentication</h2>
        <div v-if="error" class="error">{{ error }}</div>
        <button v-if="!userState.isSignedIn.value" @click="signInWithEthereum" :disabled="isLoading" class="btn-green">
            {{ isLoading ? 'Signing in...' : 'Sign-In With Ethereum' }}
        </button>
        <button v-if="userState.isSignedIn.value" @click="signOut" class="btn-green">Sign Out</button>
        <div v-if="userState.isSignedIn.value" class="start">{{ userState.address.value }}</div>
    </section>

</template>
