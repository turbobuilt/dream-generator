import { readFile } from "fs/promises";
import * as nodemailer from "nodemailer";

interface SendEmailOptions {
    to: string | string[];
    htmlFileName?: string;
    html?: string;
    from: string;
    subject: string;
    vars?: any;
}

function replaceVars(html: string, vars: any) {
    for (let key in vars) {
        html = html.replace(new RegExp(`{{${key}}}`, "g"), vars[key] || "");
    }
    return html;
}

export async function sendEmail(options: SendEmailOptions) {
    console.log("Sending email", options);
    let { to, htmlFileName, html, from, subject } = options;
    if (htmlFileName) {
        html = await readFile(`src/emails/${htmlFileName}.html`, "utf8");
    }
    if (!html) {
        throw new Error("No html provided for email");
    }
    if (!subject) {
        throw new Error("No subject provided for email");
    }
    to = Array.isArray(to) ? to : [to];
    to = to.filter(item => item && item != "null" && item != "undefined");
    if (to.length == 0) {
        console.log("not sending email b/c no emails");
        return;
    }
    const transporter = nodemailer.createTransport({
        service: 'smtp',
        host: 'smtp.mailersend.net',
        port: 587,
        auth: {
            user: process.env.mailerSendKey,
            pass: process.env.mailerSendPassword
        }
    })
    if (options.vars) 
        html = replaceVars(html, options.vars);

    const mailOptions = {
        from: from || "info@dreamgenerator.ai",
        to: to,
        subject: subject,
        html: html
    };
    let result = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.error("Error sending email")
                console.error(err);
                reject(err);
            } else {
                console.log("Email sent: " + info.response)
                resolve(info);
            }
        });
    });
    console.log("Sent email", mailOptions);
    console.log(mailOptions);
}