
    // User login controller
    app.controller("LoginController", function($scope, $rootScope, $state, $stateParams, $pouchDB, toaster) {

        // Create new user in the database for login

        // New user object
        var params = {
            _id: '1',
            username: 'admin',
            password: '123456',
            data_type: 'user'
        };
        var documentId = "1";

        // Calling the user creation function
        $pouchDB.create(params).then(function(response) {
            console.log("New user created");
        }, function(error) {
            console.log("User is created");
        });


        // Login user with username and password submitted from the form
        $scope.login = function(username, password) {
            // Calling the fetching function of the user document
            $pouchDB.get(documentId).then(function(response) {
                // checking if username and password are corrects
                if (response.username == username && response.password == password) {
                    // Redirection to the product list page
                    $state.go("list");
                } else {
                    toaster.error("Error", "Authentication Error");
                }
            }, function(error) {
                toaster.error("Error", error);
            });
        }
    })
