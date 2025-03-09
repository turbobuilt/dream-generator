import { Request, Response } from "express"
import { imageModels } from "./generateImage";

export const modalUpdateStatusKey = process.env.modal_update_status_key;

export default async function (req: Request, res: Response) {
    console.log("Modal Update Status", req.body, req.query);
    if (req.body.auth_token !== modalUpdateStatusKey && req.query.auth_token !== modalUpdateStatusKey) {
        return res.status(403).send({ error: "Unauthorized" });
    }
    let { status, output_url, guid } = req.body;
    await global.db.query(`UPDATE ImageGenerationRequest SET status = ?, outputUrl = ? WHERE taskId = ?`, [status, output_url, guid]);

    let [[imgGenRequest]] = await global.db.query(`SELECT * FROM ImageGenerationRequest WHERE taskId=?`, [guid]);

    if (imgGenRequest.status === "COMPLETED") {
        let model = imageModels[imgGenRequest.model];
        let creditCost = model.creditCost;

        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, imgGenRequest.authenticatedUser]);
        let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [imgGenRequest.authenticatedUser]);;
    }


    return res.send({ success: true });
}

export const route = { url: "/api/modal-update-status", method: "POST", authenticated: false }
