export async function updateGenerationProgress(req, res) {
    let body = req.body;
    let { key } = req.query
    if (key != process.env.modal_update_generation_progress_key) {
        return res.status(403).send("Invalid key");
    }
    let { taskId, progress, status } = body;
    let [imgGenRequest] = await global.db.query(`SELECT * FROM ImageGenerationRequest WHERE taskId=?`, [taskId]) as any[];
    if (!imgGenRequest) {
        return res.status(404).send("Task not found");
    }

    await global.db.query(`UPDATE ImageGenerationRequest SET progress=?, status=? WHERE taskId=?`, [progress, status, taskId]);
    return res.json({ success: true });
}

export const route = {
    url: "/api/update-generation-progress",
    method: 'PUT',
    authenticated: false
};