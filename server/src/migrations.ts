import { readFileSync } from "fs";

let schema = readFileSync("src/migrations/create_tables.sql","utf-8")
let migrations = {
    "create_tables": schema.toString(),
    "add startTrigger to Automailer": `ALTER TABLE Automailer ADD COLUMN startTrigger VARCHAR(255)`,
    "add subject and html long text to Automailer": `ALTER TABLE Automailer ADD COLUMN subject VARCHAR(255), ADD COLUMN html MEDIUMTEXT`,
    "create AutomailerSubscription table": `CREATE TABLE AutomailerSubscription (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, automailer BIGINT, FOREIGN KEY (automailer) REFERENCES Automailer(id), authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id))`,
    "add unsubscribed to AuthenticatedUser": `ALTER TABLE AuthenticatedUser ADD COLUMN unsubscribed TINYINT(1) DEFAULT 0`,
    "index AutomailerSubscription (created)": `CREATE INDEX created ON AutomailerSubscription (created)`,
    // export class AutomailerEmailQueue extends DbObject {
    //     authenticatedUser: number;
    //     automailerEmail: number;
    // }
    "create AutomailerEmailQueue table": `CREATE TABLE AutomailerEmailQueue (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, INDEX (created), updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, automailerEmail BIGINT, FOREIGN KEY (automailerEmail) REFERENCES AutomailerEmail(id), authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id))`,
    "add sendAt to AutomailerEmail": `ALTER TABLE AutomailerEmail ADD COLUMN sendAt BIGINT DEFAULT NULL`,
    "remove subject and html from Automailer": `ALTER TABLE Automailer DROP COLUMN subject, DROP COLUMN html`,
    "add it to AutomailerEmail": `ALTER TABLE AutomailerEmail ADD COLUMN html MEDIUMTEXT`,
    "add sent to AutomailerEmailQueue": `ALTER TABLE AutomailerEmailQueue ADD COLUMN sent TINYINT(1) DEFAULT 0`,
    "add editorCOntent to AutomailerEmail": `ALTER TABLE AutomailerEmail ADD COLUMN editorContent MEDIUMTEXT`,
    "add sendStarted to AutomailerEmailQueue": `ALTER TABLE AutomailerEmailQueue ADD COLUMN sendStarted TINYINT(1) DEFAULT 0`,
    "add error to AutomailerEmailQueue": `ALTER TABLE AutomailerEmailQueue ADD COLUMN error TEXT`,
    "add AuthenticatedUserProfilePicture": `CREATE TABLE AuthenticatedUserProfilePicture (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id), pictureGuid VARCHAR(255), nsfwResult TINYINT(1) DEFAULT 0)`,
    "add uploaded to AuthenticatedUserProfilePicture": `ALTER TABLE AuthenticatedUserProfilePicture ADD COLUMN uploaded TINYINT(1) DEFAULT 0`,
    "add checkedForNsfw to AuthenticatedUserProfilePicture": `ALTER TABLE AuthenticatedUserProfilePicture ADD COLUMN checkedForNsfw TINYINT(1) DEFAULT 0`,
    "add plan_does_not_renew to AuthenticatedUser": `ALTER TABLE AuthenticatedUser ADD COLUMN plan_does_not_renew TINYINT(1) DEFAULT 0`,
    "rename plan_does_not_renew to planDoesNotRenew in AuthenticatedUser": `ALTER TABLE AuthenticatedUser CHANGE COLUMN plan_does_not_renew planDoesNotRenew TINYINT(1) DEFAULT 0`,
    "add billingDayOfMonth to AuthenticatedUser": `ALTER TABLE AuthenticatedUser ADD COLUMN billingDayOfMonth INT DEFAULT 1`,
    "add billingError to AuthenticatedUser": `ALTER TABLE AuthenticatedUser ADD COLUMN billingError TEXT`,
    "add stripePaymentIntentId to Payment": `ALTER TABLE Payment ADD COLUMN stripePaymentIntentId VARCHAR(255)`,
    "create table PaymentAttempt": `CREATE TABLE PaymentAttempt (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id), amount INT, stripePaymentIntentId VARCHAR(255), status VARCHAR(255))`,
    "add error to PaymentAttempt": `ALTER TABLE PaymentAttempt ADD COLUMN error TEXT`,
    "add isMonthlyBill and isProration to Payment": `ALTER TABLE Payment ADD COLUMN isMonthlyBill TINYINT(1) DEFAULT 0, ADD COLUMN isProration TINYINT(1) DEFAULT 0`,
    "add localBilling to AuthenticatedUser": `ALTER TABLE AuthenticatedUser ADD COLUMN localBilling TINYINT(1) DEFAULT 0`,
    "add downgradePlanTo to AuthenticatedUser": `ALTER TABLE AuthenticatedUser ADD COLUMN downgradePlanTo VARCHAR(255)`,
    "add column amount to Payment": `ALTER TABLE Payment ADD COLUMN amount INT`,
    "create table ImageUpscaleRequest": `CREATE TABLE ImageUpscaleRequest (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id), imageGuid VARCHAR(255), status VARCHAR(255), error TEXT)`,
    "create table RemoveImageBackgroundRequest": `CREATE TABLE RemoveImageBackgroundRequest (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id), imageGuid VARCHAR(255), status VARCHAR(255), error TEXT)`,
    "add reason to BlockedAuthenticatedUser": `ALTER TABLE BlockedAuthenticatedUser ADD COLUMN reason VARCHAR(255)`,
    "add microsoftId to AuthenticatedUser": `ALTER TABLE AuthenticatedUser ADD COLUMN microsoftId VARCHAR(255)`,
    "create table Organization": `CREATE TABLE Organization (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, name VARCHAR(255), microsoftId VARCHAR(255), owner BIGINT, FOREIGN KEY (owner) REFERENCES AuthenticatedUser(id))`,
    "create table OrganizationAuthenticatedUser": `CREATE TABLE OrganizationAuthenticatedUser (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, organization BIGINT, FOREIGN KEY (organization) REFERENCES Organization(id), authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id))`,
    // export class CallRoom {
    //     name: string;
    //     uuid: string;
    // }
    
    // export class CallRoomAuthenticatedUser {
    //     callRoom: number;
    //     authenticatedUser: number;
    // }
    "create table CallRoom": `CREATE TABLE CallRoom (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, name VARCHAR(255), uuid VARCHAR(255))`,
    "create table CallRoomAuthenticatedUser": `CREATE TABLE CallRoomAuthenticatedUser (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, callRoom BIGINT, FOREIGN KEY (callRoom) REFERENCES CallRoom(id), authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id))`,
    "add originator to CallRoom": `ALTER TABLE CallRoom ADD COLUMN originator BIGINT, ADD FOREIGN KEY (originator) REFERENCES AuthenticatedUser(id)`,
    "make CallRoomAuthenticatedUser fk on delete cascade": `ALTER TABLE CallRoomAuthenticatedUser DROP FOREIGN KEY callRoomAuthenticatedUser_ibfk_1, ADD FOREIGN KEY (callRoom) REFERENCES CallRoom(id) ON DELETE CASCADE, DROP FOREIGN KEY callRoomAuthenticatedUser_ibfk_2, ADD FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id) ON DELETE CASCADE`,
    // export class AuthenticatedUserOrganization extends DbObject {
    //     authenticatedUser: number;
    //     organization: number;
    //     accepted: boolean;
    // }
    "create table AuthenticatedUserOrganization": `CREATE TABLE AuthenticatedUserOrganization (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id), organization BIGINT, FOREIGN KEY (organization) REFERENCES Organization(id), accepted TINYINT(1) DEFAULT 0, UNIQUE KEY (authenticatedUser, organization))`,
    "add callKitPushToken to AuthenticatedUser": `ALTER TABLE AuthenticatedUser ADD COLUMN callKitPushToken VARCHAR(255)`,
    "convert Prompt.text to TEXT": `ALTER TABLE Prompt MODIFY COLUMN text TEXT`,
    // "drop ChatMessage": `DROP TABLE ChatMessage`,

    "create ChatMessage": `CREATE TABLE ChatMessage (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, sentBy BIGINT, FOREIGN KEY (sentBy) REFERENCES AuthenticatedUser(id) ON DELETE CASCADE ON UPDATE CASCADE)`,

    "create ChatMessageText": `CREATE TABLE ChatMessageText (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, chatMessage BIGINT, FOREIGN KEY (chatMessage) REFERENCES ChatMessage(id) ON DELETE CASCADE ON UPDATE CASCADE, text TEXT)`,

    "create ChatMessageReceipt": `CREATE TABLE ChatMessageReceipt (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, chatMessage BIGINT, FOREIGN KEY (chatMessage) REFERENCES ChatMessage(id) ON DELETE CASCADE ON UPDATE CASCADE, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id) ON DELETE CASCADE ON UPDATE CASCADE)`,
    "add read to ChatMessageReceipt": `ALTER TABLE ChatMessageReceipt ADD COLUMN viewed TINYINT(1) DEFAULT 0`,
    "remove type from Notification": `ALTER TABLE Notification DROP COLUMN type`,
    "add chatMessage to Notification (nullable, cascade)": `ALTER TABLE Notification ADD COLUMN chatMessage BIGINT, ADD FOREIGN KEY (chatMessage) REFERENCES ChatMessage(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    "add authenticatedUserFriend to Notification": `ALTER TABLE Notification ADD COLUMN authenticatedUserFriend BIGINT, ADD FOREIGN KEY (authenticatedUserFriend) REFERENCES AuthenticatedUserFriend(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    "delete chatMessage from Notification and remove fk": `ALTER TABLE Notification DROP FOREIGN KEY notification_ibfk_1, DROP COLUMN chatMessage`,
    "now add chatMessageReceipt to Notification": `ALTER TABLE Notification ADD COLUMN chatMessageReceipt BIGINT, ADD FOREIGN KEY (chatMessageReceipt) REFERENCES ChatMessageReceipt(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    "drop sentBy ibfk from ChatMessage": `ALTER TABLE ChatMessage DROP FOREIGN KEY chatMessage_ibfk_1`,
    "rename sentBy to authenticatedUser in ChatMessage": `ALTER TABLE ChatMessage CHANGE COLUMN sentBy authenticatedUser BIGINT`,
    "add foreign key authenticatedUser to ChatMessage": `ALTER TABLE ChatMessage ADD FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    "create table GenerateAudioRequest": `CREATE TABLE GenerateAudioRequest (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, prompt TEXT, model VARCHAR(255), status VARCHAR(255), duration INT, error TEXT)`,
    "add outputUrl to GenerateAudioRequest": `ALTER TABLE GenerateAudioRequest ADD COLUMN outputUrl VARCHAR(255)`,
    "chagne outputUrl to TEXT": `ALTER TABLE GenerateAudioRequest CHANGE COLUMN outputUrl outputUrl TEXT`,

    "create table AnimateVideoRequest": `CREATE TABLE AnimateVideoRequest (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, uploadKey TEXT, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id), status VARCHAR(255), error TEXT, outputUrl TEXT, duration INT, model VARCHAR(255))`,
    "rename chatMessageReceipt to chatMessageTarget in Notification": `ALTER TABLE Notification CHANGE COLUMN chatMessageReceipt chatMessageTarget BIGINT`,

    "rename ChatMessageReceipt to ChatMessageTarget": `ALTER TABLE ChatMessageReceipt RENAME TO ChatMessageTarget`,
    "add eventDateTime to Notification": `ALTER TABLE Notification ADD COLUMN eventDateTime BIGINT`,

    "drop chatMessageTarget fk from Notification": `ALTER TABLE Notification DROP FOREIGN KEY notification_ibfk_2`,
    "drop notification_ibfk_3": `ALTER TABLE Notification DROP FOREIGN KEY notification_ibfk_3`,
    "drop chatMessageTarget from Notification": `ALTER TABLE Notification DROP COLUMN chatMessageTarget`,
    "add chatMessage to Notification": `ALTER TABLE Notification ADD COLUMN chatMessage BIGINT, ADD FOREIGN KEY (chatMessage) REFERENCES ChatMessage(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    "add temporaryChatPopupShown to AuthenticatedUser": `ALTER TABLE AuthenticatedUser ADD COLUMN temporaryChatPopupShown TINYINT(1) DEFAULT 0`,
    "index ChatMessageTarget(authenticatedUser,viewed)": `CREATE INDEX authenticatedUser_viewed ON ChatMessageTarget (authenticatedUser, viewed)`,
    "create ChatMessageVideoCallLink": `CREATE TABLE ChatMessageVideoCallLink (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, chatMessage BIGINT, FOREIGN KEY (chatMessage) REFERENCES ChatMessage(id) ON DELETE CASCADE ON UPDATE CASCADE, link TEXT)`,
    "rename ChatMessageVideoCallLink ChatMessageVideoCall": `ALTER TABLE ChatMessageVideoCallLink RENAME TO ChatMessageVideoCall`,
    "rename link to slug on ChatMessageVideoCall": `ALTER TABLE ChatMessageVideoCall CHANGE COLUMN link slug TEXT`,
    "add audio to prompt": "ALTER TABLE Prompt ADD COLUMN audio TINYINT(1)",
    "create SharedAudio": `CREATE TABLE SharedAudio (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id) ON DELETE CASCADE ON UPDATE CASCADE, path TEXT, size BIGINT, prompt TEXT, uploaded TINYINT(1) DEFAULT 0, sensitiveContentResult JSON)`,
    "add model to SharedAudio": `ALTER TABLE SharedAudio ADD COLUMN model VARCHAR(255)`,
    "add column sharedAudio to Share": `ALTER TABLE Share ADD COLUMN sharedAudio BIGINT, ADD FOREIGN KEY (sharedAudio) REFERENCES SharedAudio(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    "create class TextToSpeech": `CREATE TABLE TextToSpeech (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id) ON DELETE CASCADE ON UPDATE CASCADE, text TEXT, model VARCHAR(255), status VARCHAR(255), duration INT, error TEXT, outputUrl TEXT)`,
    "add falId varchar 255 to TextToSpeech": `ALTER TABLE TextToSpeech ADD COLUMN falId VARCHAR(255), add INDEX falId (falId)`,
    "add provider varchar 255 to TextToSpeech": `ALTER TABLE TextToSpeech ADD COLUMN provider VARCHAR(255)`,
    "make duration a Float on TextToSpeech": `ALTER TABLE TextToSpeech CHANGE COLUMN duration duration FLOAT`,
}

export async function runMigrations() {
    // create migrations table if it doesn't exist
    await global.db.query(`CREATE TABLE IF NOT EXISTS migrations (name VARCHAR(255), INDEX(name))`);
    // get all migrations that have been run
    let [migrationsRun] = await global.db.query(`SELECT * FROM migrations`) as any[];
    // get all migrations that are defined
    let migrationsDefined = Object.keys(migrations);
    // get all migrations that have not been run
    let migrationsToRun = migrationsDefined.filter(m => !migrationsRun.find(mr => mr.name === m));
    // run all migrations that have not been run
    for (let migration of migrationsToRun) {
        console.log(`Running migration: ${migration}`);
        let parts = migrations[migration].split(";");
        for (let part of parts) {
            if (part.trim()) {
                await global.db.query(part);
            }
        }
        // await global.db.query(migrations[migration]);
        await global.db.query(`INSERT INTO migrations (name) VALUES (?)`, [migration]);
    }
}