module.exports = {
    client_id: process.env.G_OAUTH_CLIENT_ID,
    client_secret: process.env.G_OAUTH_CLIENT_SECRET,
    oauth_redirect_url: process.env.G_OAUTH_REDIRECT_URL,
    access_type: process.env.G_OAUTH_ACCESS_TYPE,
    prompt: process.env.G_OAUTH_PROMPT,
    auth_success_redirect_url: process.env.AUTH_SUCCESS_REDIRECT_URL,
    auth_failure_redirect_url: process.env.AUTH_FAILURE_REDIRECT_URL,
    scope: process.env.G_OAUTH_SCOPE.split(','),
}