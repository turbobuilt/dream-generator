import { Request, Response } from "express"

export const creditPacks = {
    "ten": {
        price: 1000,
        "credits": 1200,
        stripeId: "price_1OnB6GKQlgzQQuyiA4bI6ssc",
        testStripeId: "price_1OnB6oKQlgzQQuyiDEhhU8ea",
        name: "Normal Credit Pack",
        description: "A bunch of credits!"
    }
}

export default async function (req: Request, res: Response) {
    return res.json({ creditPacks });
}