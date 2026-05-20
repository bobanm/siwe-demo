<script setup lang="ts">

import { BACKEND_URL } from '@/config';
import { ref, onMounted } from 'vue'

type Post = {
    address: string,
    timestamp: number,
    content: string,
}

const props = defineProps({
    accessToken: String,
})

const posts = ref<Post[]>([])
const content = ref('')
const error = ref('')
const isLoading = ref(false)

onMounted(() => {
    if (props.accessToken) {
        fetchPosts()
    }
})

async function submitPost() {

    error.value = ''
    isLoading.value = true

    try {
        const response = await fetch(`${BACKEND_URL}/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${props.accessToken}`,
            },
            body: JSON.stringify({
                content: content.value
            }),
        })

        if (!response.ok) {
            error.value = 'Failed to create post. Please try again.'
            return
        }

        const post = await response.json()
        posts.value.unshift(post)
        content.value = ''
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'An unexpected error occurred while posting.'
    }
    finally {
        isLoading.value = false
    }
}

async function fetchPosts() {

    error.value = ''

    try {
        const response = await fetch(`${BACKEND_URL}/post`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${props.accessToken}`,
            },
        })

        if (!response.ok) {
            error.value = 'Failed to fetch posts.'
            return
        }

        posts.value = await response.json()
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'An unexpected error occurred while fetching posts.'
    }
}

</script>

<template>

    <section id="feed" class="top-blue">
        <img src="../images/hipster.svg" class="right zoom">
        <h2>Feed</h2>
        <div v-if="error" class="error">{{ error }}</div>
        <div><textarea v-model="content" id="post" class="input-blue" rows="3" placeholder="Share something with the world..."></textarea></div>
        <button @click="submitPost" :disabled="content.length === 0 || isLoading" class="btn-blue">
            {{ isLoading ? 'Posting...' : 'New Post' }}
        </button>
        <div v-for="post in posts" :key="`${post.address}-${post.timestamp}`" class="post">
            <div class="address">👽 {{ post.address }}</div>
            <div class="date">📅 {{ new Date(post.timestamp * 1000).toLocaleString('en-GB') }}</div>
            <div class="content">{{ post.content }}</div>
        </div>
    </section>

</template>
