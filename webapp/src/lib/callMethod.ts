import axios from "axios";
import { handleHttpError } from "./handleHttpError";
import { store } from "@/store";

export async function callMethod(name, iArgs) {
    console.log("Store toekN", store.token);
    try {
        let args = [];
        for (let i = 0; i < iArgs.length; i++) {
            args.push(iArgs[i]);
        }
        // check if starts with get/post/put/delete
        let method = name.match(/^(get|post|put|delete)[A-Z]/)?.[1] || "post";
        let queryString = ""
        queryString = `?methodName=${name}`;
        if (method === "get") {
            for (let i = 0; i < args.length; i++) {
                queryString += `${i === 0 ? "&" : "&"}${args[i].key}=${args[i].value}`;
            }
        }
        let response = await fetch(`/api/method-call${queryString}`, {
            method: "POST",
            body: JSON.stringify({ methodName: name, args }),
            headers: {
                "content-type": "application/json",
                authorizationtoken: store.token
            }
        });
        let result = await response.json();
        return result;
    } catch (err) {
        return { error: err.message }
        // handleHttpError(err, `doing ${name}: ${err.message}`);
    }
}