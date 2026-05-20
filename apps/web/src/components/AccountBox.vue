<script setup lang="ts">

import { ref } from 'vue'
import { BACKEND_URL } from '@/config'

const username = defineModel('username')
const bio = defineModel('bio')

const props = defineProps({
    accessToken: String,
    isSignedIn: Boolean,
})

const error = ref('')
const isLoading = ref(false)

async function updateAccount() {

    error.value = ''
    isLoading.value = true

    try {
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

        if (!updateResponse.ok) {
            error.value = 'Failed to update account. Please try again.'
            return
        }

        await updateResponse.json()
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'An unexpected error occurred while updating.'
    }
    finally {
        isLoading.value = false
    }
}

</script>

<template>

    <section id="account" class="top-red">
        <img src="../images/santa.svg" class="right zoom">
        <h2>Account</h2>
        <div v-if="error" class="error">{{ error }}</div>
        <div><label for="username">username</label> <input id="username" v-model="username" :disabled="!isSignedIn" class="input-red"></div>
        <div class="end"><label for="bio">bio</label> <input id="bio" v-model="bio" :disabled="!isSignedIn" class="input-red"></div>
        <button @click="updateAccount" :disabled="!isSignedIn || isLoading" class="btn-red">
            {{ isLoading ? 'Updating...' : 'Update Account' }}
        </button>
    </section>

</template>
