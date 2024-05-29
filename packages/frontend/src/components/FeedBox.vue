<script setup lang="ts">

import { BACKEND_URL } from '@/config';
import { ref } from 'vue'

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

async function submitPost() {

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

    // TODO: improve handling of unsuccessful account update
    if (!response.ok) {
        console.error('Update failed')

        return
    }

    const post = await response.json()
    console.log(post)
}

async function fetchPosts() {

    const response = await fetch(`${BACKEND_URL}/post`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${props.accessToken}`,
        },
    })

    // TODO: improve handling of unsuccessful account update
    if (!response.ok) {
        console.error('Fetch failed')

        return
    }

    posts.value = await response.json()
}

</script>

<template>

    <section id="feed" class="top-blue">
        <img src="../images/hipster.svg" class="right zoom">
        <h2>Feed</h2>
        <div><textarea v-model="content" id="post" class="input-blue" rows="3" placeholder="Share something with the world..."></textarea></div>
        <button @click="submitPost" :disabled="content.length == 0" class="btn-blue">Submit Post</button>
        <button @click="fetchPosts" class="btn-blue follower">Fetch Posts</button>
        <div v-for="post in posts" :key="post.address" class="post">
            <div class="address">{{ post.address }}</div>
            <div class="date">{{ new Date(post.timestamp).toLocaleString() }}</div>
            <div class="content">{{ post.content }}</div>
        </div>
    </section>

</template>
