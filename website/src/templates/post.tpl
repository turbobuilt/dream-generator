<!DOCTYPE HTML>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="apple-itunes-app" content="app-id=6462812836">
    <script src="https://www.googletagmanager.com/gtag/js?id=AW-10814930481" async></script>
</head>

<body>
    <div class="sign-in-modal-background">
        <div class="sign-in-modal">
            <div class="close">Close</div>
            <div>Create an account or log in with Google!</div>
            <br>
            <div id="google-button"></div>
            <br>
            <div>If you don't have Google, you can't make an account. Everybody get Google! It's the best.</div>
        </div>
    </div>
    <script src="https://accounts.google.com/gsi/client" async></script>
    <script>
        function showSignInModal() {
            document.querySelector(".sign-in-modal-background").style.display = "flex";
        }
        var loggingIn = false, loginError = false;
        async function doOauthLogin(response) {
            try {
                if (loggingIn)
                    return;
                loggingIn = true;
                if (response.credential) {
                    // Send the credential to your auth backend.
                    var credential = response.credential;
                    var id_token = credential;
                    var response2 = await fetch("/api/oauth-login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ token: id_token, provider: "google" })
                    });
                    var { authenticatedUser, token, newUser, error } = await response2.json();

                    if (error) {
                        loginError = error;
                    } else {
                        // store.authenticatedUser = authenticatedUser;
                        // store.token = token;
                        // set cookie "token" to token with no expiry
                        document.cookie = `token=${token};path=/`;
                        // save token and user to local storage
                        localStorage.setItem("token", token);
                        localStorage.setItem("authenticatedUser", JSON.stringify(authenticatedUser));
                        window.location.href = "/create";
                    }
                } else {
                    // No credential was selected. The user cancelled.
                    loginError = "Login cancelled";
                }
            } catch (e) {
                console.log(e);
                loginError = "please contact support.  Error. Try again if you want, or contact support@dreamgenerator.ai for help " + e.message;
            } finally {
                loggingIn = false;
            }
        }
        var interval = setInterval(function () {
            if (typeof google == "undefined" || !document.getElementById("google-button")) {
                return;
            }
            clearInterval(interval);
            google.accounts.id.initialize({
                client_id: "790316791498-utie09qvamofv7put3tfbgltjnkghrjk.apps.googleusercontent.com",
                callback: doOauthLogin, // callback function
            });
            google.accounts.id.renderButton(
                document.getElementById("google-button"),
                { theme: "outline", size: "large" }  // customization attributes
            );
        }, 500);
    </script>
</body>

</html>