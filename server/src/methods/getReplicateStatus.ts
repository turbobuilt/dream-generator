import axios from "axios";


export async function getReplicateStatus(imgGenRequest) {
    try {
        let r2 = await axios.get(`https://api.replicate.com/v1/predictions/${imgGenRequest.taskId}`, { headers: { Authorization: `Token ${process.env.replicate_api_token}` } });
        // console.log(r2.status);
        // console.log(r2.data);
        let data = r2.data;
        imgGenRequest.status = data.status;
        if (data.status == "failed" || data.status == "cancelled") {
            imgGenRequest.status = "FAILED";
        } else if (data.output) {
            imgGenRequest.outputUrl = data.output[0];
            imgGenRequest.status = "COMPLETED";
        }
        await imgGenRequest.save()
    } catch (err) {
        console.error(err);
    }
}