export const environment = {
    production: false,
    // authApiUrl and apiUrl are the same service today; they are kept separate
    // so authentication can move to its own host without touching feature code
    authApiUrl: 'http://localhost:5030',
    apiUrl: 'http://localhost:5030'
};
