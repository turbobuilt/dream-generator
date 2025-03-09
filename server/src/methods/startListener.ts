// typescript

/*
Step 1: Import necessary libraries i.e., 'express'
Step 2: Define the async function startListener, which receives an express app as the argument.
Step 3: Inside the function, initialize it to listen on all IP addresses (use '0.0.0.0') and port 5000.
Step 4: Return the app.
*/

import express from 'express';

export async function startProxyListener(app: express.Express): Promise<express.Express> {
    // Make the app listen on all IP addresses and port 5000
    app.listen(5005, '0.0.0.0', () => {
        console.log('App listening on port http://0.0.0.1:5005');
    });
    
    return app;
}


export async function startHttpListener(app: express.Express): Promise<express.Express> {
    // Make the app listen on all IP addresses and port 5000
    app.listen(80, '0.0.0.0', () => {
        console.log('App listening on port http://0.0.0.1:5005');
    });
    
    return app;
}
