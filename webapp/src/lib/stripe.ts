import axios from "axios";

export async function openStripePortal() {
    let newWindow = window.open("about:blank", "_blank");
    let res = await axios.get("/api/get-stripe-customer-portal-link");
    newWindow.location.href = res.data.url;
}