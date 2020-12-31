var app = angular.module("inventory-app", ["ui.router", 'toaster', 'ngAnimate'])

    // Defining the database
    .run(function($pouchDB) {
        $pouchDB.setDatabase("Inventory");
    })
