import { store } from "../store";
import axios from "axios";

export function formatMoney(amount) {
    // locale
    let formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    return formatter.format(amount / 100);
}

export async function getPlans() {
    let response = await axios.get("/api/get-plans");
    store.plans = response.data.items;
}