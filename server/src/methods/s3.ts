import { S3Client } from "@aws-sdk/client-s3";


// token: Fq0K0x98cIADyrpeic8-CUQ1T-7d1t0MYfPCVRr_
export const dreamGenOutS3Client = new S3Client({
    region: "auto",
    endpoint: "https://6d1fd8715ac1dc4960355505312f9f79.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: process.env.cloudflare_r2_access_key_id,
        secretAccessKey: process.env.cloudflare_r2_secret_access_key,
    }
});
