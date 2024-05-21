<script setup lang="ts">

import { inject } from 'vue'
import { BACKEND_URL } from '../config'
import type { BrowserProvider } from 'ethers'

const isSignedIn = defineModel('isSignedIn')
const address = defineModel('address')
const username = defineModel('username')
const bio = defineModel('bio')

const provider = inject<BrowserProvider>('provider') as BrowserProvider

async function signInWithEthereum() {

    const signer = await provider.getSigner()
    const chainId = (await (provider.getNetwork())).chainId

    const encodedParams = {
        address: encodeURIComponent(signer.address),
        chainId: encodeURIComponent(String(chainId)),
        domain: encodeURIComponent(window.location.host),
    }

    const message = await (await fetch(`${BACKEND_URL}/message?${new URLSearchParams(encodedParams)}`)).text()
    console.log(message)

    const signature = await signer.signMessage(message)
    console.log(signature)

    const signInResponse = await fetch(`${BACKEND_URL}/sign-in`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
    })

    // TODO: improve handling of unsuccessful sign-in
    if (!signInResponse.ok) {
        console.error('Sign-in failed')

        return
    }

    const account = await signInResponse.json()
    console.log(account)

    address.value = account.address
    username.value = account.username
    bio.value = account.bio
    isSignedIn.value = true
}

function signOut() {

    address.value = ''
    username.value = ''
    bio.value = ''
    isSignedIn.value = false
}

</script>

<template>

    <section id="sign-in" class="top-green">
        <img src="../images/pilot.svg" class="right zoom">
        <h2>Authentication</h2>
        <button v-if="!isSignedIn" @click="signInWithEthereum" class="btn-green">Sign-In With Ethereum</button>
        <button v-if="isSignedIn" @click="signOut" class="btn-green">Sign Out</button>
        <div v-if="isSignedIn" class="start">{{ address }}</div>
    </section>

</template>