import { ref, type Ref } from 'vue'

export interface UserState {
    isSignedIn: Ref<boolean>
    accessToken: Ref<string>
    address: Ref<string>
    username: Ref<string>
    bio: Ref<string>
}

// userState is a module-level constant so that every call to useUserState()
// returns the same object. This way all components share the same refs.
// Inlining the refs inside useUserState() would create a new independent
// object per call, breaking cross-component reactivity.
const userState: UserState = {
    isSignedIn: ref(false),
    accessToken: ref(''),
    address: ref(''),
    username: ref(''),
    bio: ref(''),
}

export function useUserState(): UserState {

    return userState
}
