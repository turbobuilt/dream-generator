import { store } from "@/store";
import axios from "axios";
import { reactive } from "vue";

export async function setUserData(data) {
    let { authenticatedUser, token } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("accountCreated", "true");
    store.authenticatedUser = authenticatedUser;
    store.token = token;
}

export async function getLoggedInUser() {
    try {
        store.token = localStorage.getItem("token");
        let res = await axios.get("/api/authenticated-user");
        if (!store.authenticatedUser) {
            store.authenticatedUser = reactive({}) as any;
        }
        // store.authenticatedUser = res.data.authenticatedUser;
        Object.assign(store.authenticatedUser, res.data.authenticatedUser);
    } catch (err) {
        store.authenticatedUser = null;
        console.error(err);
    } finally {

    }
}