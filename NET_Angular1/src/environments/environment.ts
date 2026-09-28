export const environment = {
    production: true,
    // authApiUrl and apiUrl are the same service today; they are kept separate
    // so authentication can move to its own host without touching feature code
    authApiUrl: 'http://localhost:5030',
    apiUrl: 'http://localhost:5030'
    // authApiUrl: 'https://dotnetapp1-b9g3dfarb7h5anc7.westus2-01.azurewebsites.net',
    // apiUrl: 'https://dotnetapp1-b9g3dfarb7h5anc7.westus2-01.azurewebsites.net'
};
