import { inspect } from "util";
import { plans } from "./createPaymentIntent";
import { creditPacks } from "./getCreditPacksList";
import Stripe from "stripe";
import { CronJob } from "cron";
import moment from "moment";
import { PaymentAttempt } from "../models/PaymentAttempt";
import { Payment } from "../models/Payment";
import { AuthenticatedUser } from "../models/AuthenticatedUser";

export async function verifyStripeCreditPackPayment(req, res) {

}
console.log("starting billing cron");
// every day at one second before midnight UTC bill subscription updates
export const billSubscriptions = new CronJob('0 59 23 * * *', async function() {
// export const billSubscriptions = new CronJob(' * * * * *', async function() {
    console.log("billing subscriptions...");
    const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);

    // find all days where it's a) current day b) next day is 1st of month
    let targetDay = moment(); //.subtract(1, 'day');
    let daysInMonth = targetDay.daysInMonth();
    let currentDayOfMonth = targetDay.date();
    let placeholders = ["?"], days = [currentDayOfMonth];
    if (currentDayOfMonth == daysInMonth) {
        for (let i = currentDayOfMonth + 1; i <= 31; ++i) {
            days.push(i);
            placeholders.push("?");
        }
    }
    console.log("days are", days);
    // select users who haven't been billed in last 15 days, who's billing date is today
    let [users] = await db.query(`
        SELECT AuthenticatedUser.* 
        FROM AuthenticatedUser 
        WHERE localBilling=1 
            AND plan IS NOT NULL 
            AND plan <> '' 
            AND stripeId IS NOT NULL
            AND billingDayOfMonth IN (${placeholders.join(",")})
            AND NOT EXISTS (
                SELECT 1 
                FROM Payment 
                WHERE Payment.authenticatedUser = AuthenticatedUser.id 
                    AND Payment.created > ${targetDay.subtract(15, 'days').toDate().getTime()}
            )
    `, days) as AuthenticatedUser[][];
    // console.log("users are", users);
    let userInfos = [];
    for(let user of users) userInfos.push("id:" + user.id + " email: " + user.email);
    console.log("users are", userInfos);
    for (let authenticatedUser of users) {
        try {
            // get user again
            [[authenticatedUser]] = await db.query("SELECT * FROM AuthenticatedUser WHERE id=?", [authenticatedUser.id]) as AuthenticatedUser[][];
            if (!authenticatedUser) {
                console.error('authenticatedUser not found', authenticatedUser);
                continue;
            }

            let customer = await stripe.customers.retrieve(authenticatedUser.stripeId) as Stripe.Customer;
            let plan = plans.find(item => item.id == authenticatedUser.plan);
            if (!plan) {
                db.query("UPDATE AuthenticatedUser SET billingError=?, plan=null WHERE id=?", [`Plan not found ${authenticatedUser.plan}`, authenticatedUser.id]).catch(console.error);
                continue;
            }
            if (authenticatedUser.downgradePlanTo) {
                if (authenticatedUser.downgradePlanTo === "cancel") {
                    // await stripe.subscriptions.del(customer.subscriptions.data[0].id);
                    await db.query("UPDATE AuthenticatedUser SET plan=null, downgradePlanTo=null, billingDayOfMonth=null WHERE id=?", [authenticatedUser.id]);
                    continue;
                }
                authenticatedUser.plan = authenticatedUser.downgradePlanTo;
                authenticatedUser.downgradePlanTo = null;
                await db.query("UPDATE AuthenticatedUser SET plan=?, downgradePlanTo=null WHERE id=?", [authenticatedUser.plan, authenticatedUser.id]);
            }


            let [[lastPaymentAttemptIn24Hours]] = await db.query("SELECT * FROM PaymentAttempt WHERE authenticatedUser=? AND status='succeeded' AND created > ?", [authenticatedUser.id, targetDay.toDate().getTime() - 24 * 60 * 60 * 1000]);
            if (lastPaymentAttemptIn24Hours) {
                console.log("Last payment attempt was less than 24 hours ago, not billing");
                continue;
            }

            // get last payment of user where isMonthlyBill=1
            let [[lastPayment]] = await db.query("SELECT * FROM Payment WHERE authenticatedUser=? AND isMonthlyBill=1 ORDER BY created DESC LIMIT 1", [authenticatedUser.id]);
            // if is in last 15 days, don't bill
            if (lastPayment && lastPayment.created > targetDay.subtract(15, 'days').toDate().getTime()) {
                console.log("Last payment was less than 15 days ago, not billing!!! for user", authenticatedUser.id);
                continue;
            }

            // charge default payment method
            console.log("renewing subscription for user", authenticatedUser.id);
            let paymentMethods = await stripe.paymentMethods.list({
                customer: customer.id,
            })
            if (!paymentMethods.data.length) {
                db.query("UPDATE AuthenticatedUser SET billingError=? WHERE id=?", ["No payment methods", authenticatedUser.id]).catch(console.error);
                continue;
            }
            let defaultPaymentMethod = paymentMethods.data[0];

            let paymentAttempt = new PaymentAttempt();
            paymentAttempt.authenticatedUser = authenticatedUser.id;
            paymentAttempt.amount = plan.price;
            paymentAttempt.status = "created";
            await paymentAttempt.save();

            try {
                let paymentIntent = await stripe.paymentIntents.create({
                    amount: plan.price,
                    currency: 'usd',
                    customer: customer.id,
                    payment_method: defaultPaymentMethod.id,
                    off_session: true,
                    confirm: true,
                    receipt_email: authenticatedUser.email,
                    metadata: {
                        plan: plan.id
                    }
                });
                let payment = new Payment();
                payment.authenticatedUser = authenticatedUser.id;
                payment.stripePaymentIntentId = paymentIntent.id;
                payment.amount = plan.price;
                payment.credits = plan.credits;
                payment.isMonthlyBill = true;
                payment.isProration = false;
                await payment.save();
                // now add credits
                await db.query("UPDATE AuthenticatedUser SET creditsRemaining=creditsRemaining+? WHERE id=?", [plan.credits, authenticatedUser.id]);
            } catch (err) {
                db.query("UPDATE AuthenticatedUser SET billingError=? WHERE id=?", [err.message, authenticatedUser.id]).catch(console.error);
                paymentAttempt.status = "failed";
                paymentAttempt.error = err.message;
                paymentAttempt.save().catch(console.error);
            }
        } catch (err) {
            db.query("UPDATE AuthenticatedUser SET billingError=? WHERE id=?", [err.message, authenticatedUser.id]).catch(console.error);
        }
    }
});

export function startBillSubscriptionsCron() {
    billSubscriptions.start();
}

export async function verifyStripePayment(req, res) {
    let [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id])
    let { paymentIntent, isTest, creditPack, isNewVersion } = req.body;
    console.log("body is", req.body);
    if (isTest === null || isTest === undefined)
        isTest = process.env.NODE_ENV !== 'production';
    const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);

    if (isNewVersion) {
        const stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent);
        if (stripePaymentIntent.status != "succeeded") {
            console.error("Payment failed: ", paymentIntent, "customer ", authenticatedUser.id);
            return res.send({ error: "Payment didn't complete.  Please contact support@dreamgenerator.ai for help" });
        }
        let plan = plans.find(item => item.id == stripePaymentIntent.metadata.plan);

        // record successful payment
        let payment = new Payment();
        payment.authenticatedUser = authenticatedUser.id;
        payment.amount = stripePaymentIntent.amount;
        payment.stripePaymentIntentId = stripePaymentIntent.id;
        payment.credits = plan.credits;
        payment.isMonthlyBill = true;
        payment.isProration = false;
        await payment.save();

        if (!plan) {
            return res.send({ error: "Payment succeeded, but there was an error with the computer verifying which plan you are on. The system thinks your plan is: '" + stripePaymentIntent?.metadata?.plan + "' but it wasn't found. This may be confusing, but it's a bug, so just let us know.  Please don't try again!  Please contact support@dreamgenerator.ai for help and we will resolve quickly.  Your user id is: " + req.authenticatedUser?.id + ".  We apologize for the frustration and will do our best to fix this bug quickly!  Sincerely, and apologetically, the team." });
        }
        let billingDayOfMonth = moment().date();
        await db.query("UPDATE AuthenticatedUser SET plan=?, creditsRemaining=creditsRemaining+?, billingDayOfMonth=?, localBilling=?, downgradePlanTo=NULL WHERE id=?", [plan.id, plan.credits, billingDayOfMonth, true, req.authenticatedUser.id]);

    } else {

        console.log("verifying payment intent", paymentIntent);
        // include invoice
        const stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent, {
            expand: ['invoice']
        });
        if (stripePaymentIntent.status != "succeeded") {
            console.error("Payment failed: ", paymentIntent, "customer ", authenticatedUser.id);
            return res.send({ error: "Payment status is not succeeded.  Please contact support@dreamgenerator.ai for help.  We apologize for the inconvenience, this should not happen if payment succeeds." });
        }
        // update the default payment method
        console.log(stripePaymentIntent);
        let paymentMethod = stripePaymentIntent.payment_method;
        let subscriptionId = (stripePaymentIntent.invoice as Stripe.Invoice).subscription as string;
        await stripe.subscriptions.update(subscriptionId, {
            default_payment_method: paymentMethod as string
        });
        let customer = await stripe.customers.retrieve(authenticatedUser.stripeId) as Stripe.Customer;
        console.log("customer is", customer);

        var plan;
        if (creditPack) {
            let creditPackId = stripePaymentIntent.metadata.creditPack;
            let pack = creditPacks[creditPackId];
            if (!pack) {
                return res.send({ error: "Your purchase was successful, but there was an error applying credits to your account.  Please email developer@dreamgenerator.ai immediately and we will fix. Hopefully you're not too upset, please forgive!" });
            }
            await db.query("UPDATE AuthenticatedUser SET creditsRemaining=creditsRemaining+? WHERE id=?", [pack.credits, req.authenticatedUser.id]);
        } else {
            let planInfo = stripePaymentIntent?.invoice?.lines?.data[0].plan;
            console.log("plan is", inspect(planInfo))
            if (planInfo.active != true) {
                return res.send({ error: "The plan has not been activated.  This may mean that you are hacking... If so please reform.  You will be happy helping people out.  Otherwise, please contact support if you think this is a problem.  Sincerely, management." });
            }
            let planId = planInfo.id;
            console.log("planId is", planId);
            plan = plans.find(item => item.stripeId == planId);
            if (!plan) {
                return res.send({ error: "Payment succeeded, but there was an error with the computer verifying which plan you are on.  Please don't try again!  Please contact support@dreamgenerator.ai for help and we will resolve quickly.  We apologize for the frustration and will do our best to fix this bug quickly!  Sincerely, and apologetically, the team." });
            }
            console.log("verifying stripe payment")
            await db.query("UPDATE AuthenticatedUser SET plan=?, creditsRemaining=creditsRemaining+? WHERE id=?", [plan.id, plan.credits, req.authenticatedUser.id]);
        }
    }
    let [[updatedUser]] = await db.query("SELECT * FROM AuthenticatedUser WHERE id=?", [req.authenticatedUser.id]);

    return res.send({
        creditsRemaining: updatedUser.creditsRemaining,
        plan: updatedUser.plan,
    });
}

export const route = {
    url: "/api/verify-stripe-payment",
    method: 'POST',
    authenticated: true
};