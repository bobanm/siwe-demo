<script setup lang="ts">

import { ref, inject } from 'vue'
import { BACKEND_URL } from '@/config'
import type { UserState } from '@/composables/useUserState'

const userState = inject<UserState>('userState')!

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
                'Authorization': `Bearer ${userState.accessToken.value}`,
            },
            body: JSON.stringify({
                username: userState.username.value,
                bio: userState.bio.value
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
        <div><label for="username">username</label> <input id="username" v-model="userState.username.value" :disabled="!userState.isSignedIn.value" class="input-red"></div>
        <div class="end"><label for="bio">bio</label> <input id="bio" v-model="userState.bio.value" :disabled="!userState.isSignedIn.value" class="input-red"></div>
        <button @click="updateAccount" :disabled="!userState.isSignedIn.value || isLoading" class="btn-red">
            {{ isLoading ? 'Updating...' : 'Update Account' }}
        </button>
    </section>

</template>
