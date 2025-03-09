import { callMethod } from "@/lib/callMethod";

export function getAnimateVideoUploadLink({ size, duration, contentType }: { size: any; duration: any; contentType: any; }) {
    return callMethod("getAnimateVideoUploadLink", arguments);
}
