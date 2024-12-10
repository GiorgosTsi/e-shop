window.config = {
    productsServiceHost: 'http://localhost',
    productsServicePort: '5000' ,
    ordersServiceHost: 'http://localhost',
    ordersServicePort: '5001' ,
    keycloakHost: 'http://localhost', // with 127.0.0.1 we get cookie error in keycloak login!
    keycloakPort: '8182' ,
    frontend : "http://127.0.0.1:3000"
};