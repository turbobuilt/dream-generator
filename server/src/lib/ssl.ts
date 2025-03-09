import acme from "acme-client";
import * as dns from "node:dns";
import fs from "fs/promises";
import { execSync } from "node:child_process";
import path, { join } from "node:path";
import * as tls from "tls";
import { X509Certificate } from "crypto";
import { readFile } from "fs/promises";
import { access, mkdir } from "node:fs/promises";
import { mkdirSync } from "node:fs";


const certDir = "certs";
const publicPath = join(process.cwd(), "../public");
function log(m) {
    console.log(m)
}

const certs: { [domain: string]: { cert: Buffer, key: Buffer } } = {};

// regenerate certificate when it gets close to expiry
async function ensureCertValid() {
    let domain = "live.turbobuilt.com";
    const certPath = path.join(certDir, `${domain}.cert.pem`);

    let [result] = await Promise.allSettled([access(domain)]);
    if (result.status === "rejected") {
        console.log("Cert doesn't exist... creating!")
        await getCertificate(domain);
        return;
    }

    // check if cert expired
    try {
        var expiresInOneWeek = await willExpireInOneWeek(domain)
    } catch (err) {
        console.error("error checking cert", err);
        return;
    }
    if (expiresInOneWeek) {
        console.log("expires in one week, renewing!");
        await getCertificate(domain);
    } else {
        console.log("good to go")
    }
}
// setInterval(() => {
//     ensureCertValid();
// }, 24 * 60 * 60 * 1000);

async function willExpireInOneWeek(domain) {
    try {
        await mkdir(certDir, { recursive: true })
        const certPath = path.join(certDir, `${domain}.cert.pem`);
        const certificate = await readFile(certPath);
        const x509 = new X509Certificate(certificate);
        const validTo = new Date(x509.validTo);
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

        return validTo <= oneWeekFromNow;
    } catch (error) {
        console.error('Error checking certificate expiration:', error);
        return false;
    }
}

export async function getCertificate(domain) {
    const certPath = path.join(certDir, `${domain}.cert.pem`);
    const keyPath = path.join(certDir, `${domain}.key.pem`);

    try {
        var [cert, key] = await Promise.all([
            fs.readFile(certPath),
            fs.readFile(keyPath),
        ]);
        certs[domain] = { cert, key }
        let certObj = tls.createSecureContext(certs[domain]);
        return certObj;
    } catch (err) {
        console.error(`Error reading certificate or key for domain ${domain}:`, err);
        return null;
    }
};

async function getFileDir(authz, challenge) {
    let domain = authz.identifier.value;
    let dir = `${publicPath}/.well-known/acme-challenge`;
    await fs.mkdir(dir, { recursive: true })
    const filePath = `${dir}/${challenge.token}`;
    return filePath
}

async function challengeCreateFn(authz, challenge, keyAuthorization) {
    log('Triggered challengeCreateFn()');
    console.log(authz, challenge, keyAuthorization)

    /* http-01 */
    if (challenge.type === 'http-01') {
        const fileContents = keyAuthorization;
        let filePath = await getFileDir(authz, challenge);
        log(`Creating challenge response for ${authz.identifier.value} at path: ${filePath}`);
        log(`Would write "${fileContents}" to path "${filePath}"`);
        await fs.writeFile(filePath, fileContents);
    }
}

async function challengeRemoveFn(authz, challenge, keyAuthorization) {
    log('Triggered challengeRemoveFn()');
    let domain = authz.identifier.value;

    /* http-01 */
    if (challenge.type === 'http-01') {
        let filePath = await getFileDir(authz, challenge);
        log(`Removing challenge response for ${authz.identifier.value} at path: ${filePath}`);
        log(`Would remove file on path "${filePath}"`);
        await fs.unlink(filePath);
    }
}

/**
 * Main
 */
export async function createCertificate(domains: string[]) {
    // first run a quick dns check to make sure the ip A record resolves to XXX.XXX.XXX.XXX
    let promises = [];
    let records = await Promise.all(domains.map(domain => dns.promises.resolve4(domain, { ttl: true })));
    for (let i = 0; i < records.length; ++i) {
        let record = records[i];
        if (record.length === 0) {
            console.log(record);
            throw new Error("Error - no A record for domain " + domains[i]);
        }
    }
    console.log(records[0]);

    /* Init client */
    let privateKey = await acme.crypto.createPrivateRsaKey();
    console.log(privateKey)
    console.log("makingclient")
    const client = new acme.Client({
        directoryUrl: acme.directory.letsencrypt.production,
        accountKey: await acme.crypto.createPrivateRsaKey(2048),
    });
    console.log("making csr")
    /* Create CSR */
    const [key, csr] = await acme.crypto.createCsr({
        altNames: domains,
    });
    console.log("making certificate")
    /* Certificate */
    const cert = await client.auto({

        csr,
        email: 'hdtruelson@gmail.com',
        termsOfServiceAgreed: true,
        challengeCreateFn,
        challengeRemoveFn,
        challengePriority: ["http-01", "dns-01"]
    });

    // write them to disk
    let certDir = "/etc/nginx/ssl";
    await fs.mkdir(certDir, { recursive: true });
    for (let domain of domains) {
        await fs.writeFile(`${certDir}/${domain}.csr.pem`, cert.toString());
        await fs.writeFile(`${certDir}/${domain}.cert.pem`, cert.toString());
        await fs.writeFile(`${certDir}/${domain}.key.pem`, key.toString());
    }

    return await Promise.all(domains.map(domain => getCertificate(domain)));
    // run command /usr/sbin/service
    // return execSync("/usr/sbin/service nginx reload");
};