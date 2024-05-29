<script setup lang="ts">

import { BACKEND_URL } from '@/config'

const username = defineModel('username')
const bio = defineModel('bio')

const props = defineProps({
    accessToken: String,
    isSignedIn: Boolean,
})

async function updateAccount() {

    const updateResponse = await fetch(`${BACKEND_URL}/account`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${props.accessToken}`,
        },
        body: JSON.stringify({
            username: username.value,
            bio: bio.value
        }),
    })

    // TODO: improve handling of unsuccessful account update
    if (!updateResponse.ok) {
        console.error('Update failed')

        return
    }

    const account = await updateResponse.json()
    console.log(account)
}

</script>

<template>

    <section id="account" class="top-red">
        <img src="../images/santa.svg" class="right zoom">
        <h2>Account</h2>
        <div><label for="username">username</label> <input id="username" v-model="username" :disabled="!isSignedIn" class="input-red"></div>
        <div class="end"><label for="bio">bio</label> <input id="bio" v-model="bio" :disabled="!isSignedIn" class="input-red"></div>
        <button @click="updateAccount" :disabled="!isSignedIn" class="btn-red">Update Account</button>
    </section>

</template>
