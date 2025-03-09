
export async function postGetSharedEmails(req, res) {
    let { emails } = req.body;
    if(!emails.length) {
        return res.json({ emails: [] });
    }
    // run sql query to find and remove all emails that are already in ShareContact
    let [items] = await global.db.query(`SELECT email FROM ShareContact WHERE email IN (?)`, [emails]) as any[];
    // let emailsToRemove = [];
    // for (let i = 0; i < items.length; i++) {
    //     emailsToRemove.push(items[i].email);
    // }
    // emails = emails.filter(email => !emailsToRemove.includes(email));
    // console.log(emails);
    // return res.json({ emails });


    // let [items] = await global.db.query(`SELECT email FROM ShareContact WHERE authenticatedUser=?`, [req.authenticatedUser.id]) as any[];
    let existingEmails = [];
    for (let i = 0; i < items.length; i++) {
        existingEmails.push(items[i].email);
    }
    return res.json({ items: existingEmails });
}


export const route = {
    url: "/api/shared-emails",
    method: 'POST',
    authenticated: true,
};
