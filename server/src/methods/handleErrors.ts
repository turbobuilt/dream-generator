import { Express } from "express";

export async function handleErrors(app: Express) {
    function errorHandler(err, req, res, next) {
        if (res.headersSent) {
            return next(err)
        }
        let datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
        console.error(datetime)
        console.error(err);
        res.status(500).json({ error: err.message });
        // res.render('error', { error: err })
    }
    app.use(errorHandler);
}