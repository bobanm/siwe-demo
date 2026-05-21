<script setup lang="ts">

import { ref } from 'vue'

const isOpen = ref(false)

</script>

<template>
    <img src="../images/question.svg" class="zoom" style="cursor: pointer" @click="isOpen = true" alt="About">

    <div v-if="isOpen" id="modal-mask">
        <section id="modal-dialog" class="top-red">
            <span @click="isOpen = false" id="modal-close">&times;</span>
            <h2>What is Going on Here?</h2>
            <div class="about-content">
                <p>
                    This app demonstrates how to use an Ethereum wallet to authenticate, using
                    <a href="https://eips.ethereum.org/EIPS/eip-4361" target="_blank">EIP-4361 Sign-In with Ethereum (SIWE)</a> standard.
                </p>

                <h3>How It Works</h3>
                <ul>
                    <li>Connect your Ethereum wallet [e.g. Rabby, MetaMask]</li>
                    <li>Click "Sign-In With Ethereum" to authenticate</li>
                    <li>Sign the SIWE message with your wallet</li>
                    <li>Once authenticated, you can use all the features</li>
                </ul>

                <h3>Features</h3>
                <ul>
                    <li><strong>Authentication:</strong> Secure wallet-based sign-in using SIWE</li>
                    <li><strong>Account Management:</strong> Update your username and bio</li>
                    <li><strong>Feed:</strong> View posts from all users</li>
                </ul>

                <h3>Tech Stack</h3>
                <ul>
                    <li><strong>Frontend:</strong> Vue 3 + Vite + viem</li>
                    <li><strong>Backend:</strong> Hono + Drizzle + SQLite</li>
                    <li><strong>Auth:</strong> Sign-In with Ethereum (SIWE) + JWT</li>
                </ul>
            </div>
        </section>
    </div>
</template>

<style scoped>
.about-content {
    text-align: left;
}
</style>
