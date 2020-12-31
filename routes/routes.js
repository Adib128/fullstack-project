// Defining the routes of the app
app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        // Login route
        .state("login", {
            "url": "/login",
            "templateUrl": "views/login.html",
            "controller": "LoginController"
        })
        //Product list route
        .state("list", {
            "url": "/list",
            "templateUrl": "views/list.html",
            "controller": "ProductController"
        })
        // Adding new and Updating existing product route
        .state("item", {
            "url": "/item/:documentId/:documentRevision",
            "templateUrl": "views/item.html",
            "controller": "ProductController"
        })
        // Showing product informations route
        .state("show", {
            "url": "/show/:documentId",
            "templateUrl": "views/show.html",
            "controller": "ProductController"
        });
    $urlRouterProvider.otherwise("login");
});
