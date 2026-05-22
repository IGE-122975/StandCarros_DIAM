// Lê o token CSRF do cookie que o Django coloca no browser após o login.
// Necessário em todos os pedidos que modificam dados (POST, PUT, DELETE).
export function getCSRFToken() {
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='));
    return cookie ? cookie.split('=')[1] : null;
}
