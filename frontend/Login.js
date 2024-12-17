export class Login {

    static logSignIn() {
        const realm_name = 'eshop';
        const client_name = 'frontend-client';

        const keycloakAuthUrl = `${window.config.keycloakHost}:${window.config.keycloakPort}/realms/${realm_name}/protocol/openid-connect/auth/?response_type=code&client_id=${client_name}&redirect_uri=${window.config.frontend}`;
        
        // Mark that the login process has started
        localStorage.setItem('isLoginInitiated', 'true');

        // Redirect the browser to Keycloak
        window.location.href = keycloakAuthUrl;
    }


    static handleRedirect() {

        const realm_name = 'eshop';
        const urlParams = new URLSearchParams(window.location.search);
    
        // Check if login was initiated
        const isLoginInitiated = localStorage.getItem('isLoginInitiated') === 'true';
    
        if (isLoginInitiated && urlParams.has('code')) {
            const code = urlParams.get('code');
            console.log(`Authorization code: ${code}`);
            localStorage.setItem('code', code);
    
            // Exchange the authorization code for an access token
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    
            const urlencoded = new URLSearchParams();
            urlencoded.append("grant_type", "authorization_code");
            urlencoded.append("code", code);
            urlencoded.append("client_id", "frontend-client"); 
            urlencoded.append("redirect_uri", window.config.frontend); // Must match the redirect URI used in Keycloak
    
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: urlencoded,
                redirect: "follow",
            };
            
            
            fetch(`${window.config.keycloakHost}:${window.config.keycloakPort}/realms/${realm_name}/protocol/openid-connect/token`, requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(result => {
                    console.log("Token Exchange Success:", result);
                    // Store tokens in localStorage
                    localStorage.setItem("access_token", result.access_token);
                    localStorage.setItem("refresh_token", result.refresh_token); 
                    localStorage.setItem("id_token", result.id_token); 

                    console.log(Login.decodeJwt(result.access_token)); // you can see the user role from here!
                    localStorage.setItem("role" , Login.decodeJwt(result.access_token).role );
                    localStorage.setItem("username" , Login.decodeJwt(result.access_token).name );
                    // Clear the login flag
                    localStorage.removeItem('isLoginInitiated');

                    alert("Succesfull login!");
                    location.reload();
                })
                .catch(error => {
                    console.error("Error exchanging token:", error);
                    localStorage.removeItem('isLoginInitiated'); // Clear the flag on failure
                });
        } else {
            console.log('Redirect detected, but no login initiated or no code found.');
        }
    }


    static decodeJwt(jwtToken) {
        /*
        Note that in order to get the user role (customer or seller) 
        we had to add a custom protocol mapper for the user attribute role_user.
        This has been made in the admin page of keycloak in the frontend_client.
        Now the role of the user is visible in "role" attribute when you decode the JWT access_token!
        */

        const base64Url = jwtToken.split('.')[1]; // Get the payload part of the JWT
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Replace Base64 URL encoding characters
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')); // Decode Base64 and handle URI component encoding
      
        return JSON.parse(jsonPayload);
    }

    static logout(){

        const realm_name = 'eshop';
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        const urlencoded = new URLSearchParams();
        urlencoded.append("refresh_token", localStorage.getItem('refresh_token'));
        urlencoded.append("client_id", "frontend-client");

        const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
        };

        fetch(`${window.config.keycloakHost}:${window.config.keycloakPort}/realms/${realm_name}/protocol/openid-connect/logout`, requestOptions)
        .then(response => {
            if (response.ok) {
                // Clear local storage variables
                localStorage.removeItem('code');
                localStorage.removeItem('id_token');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('role');
                localStorage.removeItem('username');
                
                // Redirect to the home page
                window.location.href = window.config.frontend;

                // After redirect, reset the URL parameters
                window.history.replaceState({}, document.title, "/");
            } else {
                console.error("Logout failed:", response.statusText);
            }
        })
        .catch(error => console.error("Error during logout:", error));
        
    }
    
}
