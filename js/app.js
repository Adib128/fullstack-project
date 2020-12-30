angular.module("pouchapp", ["ui.router"])
    
    // Defining the database
    .run(function($pouchDB) {
        $pouchDB.setDatabase("Inventory");
    })

    // Defining the routes of the app
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            // Login route
            .state("login", {
                "url": "/login",
                "templateUrl": "templates/login.html",
                "controller": "LoginController"
            })
            //Product list route
            .state("list", {
                "url": "/list",
                "templateUrl": "templates/list.html",
                "controller": "ProductController"
            })
            // Adding new and Updating existing product route
            .state("item", {
                "url": "/item/:documentId/:documentRevision",
                "templateUrl": "templates/item.html",
                "controller": "ProductController"
            })
            // Showing product informations route
            .state("show", {
                "url": "/show/:documentId",
                "templateUrl": "templates/show.html",
                "controller": "ProductController"
            });
        $urlRouterProvider.otherwise("login");
    })

    // Product management controller
    .controller("ProductController", function($scope, $rootScope, $state, $stateParams, $pouchDB) {

        $scope.items = {};

        $scope.data = 0;

        // Calling the function for listening to any change of the database
        $pouchDB.startListening();

        // Listen for changes which include create or update events
        $rootScope.$on("$pouchDB:change", function(event, data) {
            if (data.doc.data_type == "product") {
                $scope.items[data.doc._id] = data.doc;
                $scope.data = 1;
                $scope.$apply();
            }
        });

        // Listen for changes which include only delete events
        $rootScope.$on("$pouchDB:delete", function(event, data) {
            if (data.doc.data_type == "product") {
                $scope.items[data.doc._id] = data.doc;
                $scope.data = 1;
                $scope.$apply();
            }
        });

        // Checking if the url containing a paramater _id
        if ($stateParams.documentId) {
            // Call to the querying document function for getting the document by the id
            $pouchDB.get($stateParams.documentId).then(function(result) {
                // Fetching result for form (add and edit product page)
                $scope.inputForm = result;
                // Fetching result for showing (show product page)
                $scope.product = result;
            });
        }

        // Save a document with either an update or insert
        $scope.save = function(code, name, brand, price) {
            var jsonDocument = {
                "code": code,
                "name": name,
                "brand": brand,
                "price": price,
                "data_type": "product"
            };

            // If we're updating, provide the most recent revision and document id
            if ($stateParams.documentId) {
                jsonDocument["_id"] = $stateParams.documentId;
                jsonDocument["_rev"] = $stateParams.documentRevision;
            }
            $pouchDB.save(jsonDocument).then(function(response) {
                alert("The product recorded successfuly");
                // Redirection to the product list
                $state.go("list");
            }, function(error) {
                console.log("ERROR -> " + error);
            });
        }

        // Deleting the product
        $scope.delete = function(id, rev) {
            // Asking the user for confirmation
            if (confirm("Do you want to delete this product!")) {
                // Calling the function of deleting the product
                $pouchDB.delete(id, rev).then(function() {
                    alert("The product deleted successfuly");
                    // Reloasing the product list page
                    $state.transitionTo($state.current, $stateParams, {
                        reload: true,
                        inherit: false,
                        notify: true
                    });
                });

            }
        }

        // Deleting seleted list of products
        $scope.deleteSelected = function() {
            var tabList = [];
            var obj = {};
            angular.forEach($scope.items, function(value) {
                if (value.delete) {
                    // Creating of an object containing the _deleted to make the bulk delete
                    obj = {
                        _id: value._id,
                        _rev: value._rev,
                        _deleted: true
                    }
                    // Adding the object to the bulk deleted list
                    tabList.push(obj);
                }
            });

            // Asking user to confirm the products delete
            if (confirm("Do you want to delete this products!")) {
                // Calling the function of multi products deleting (Bulk Delete)
                $pouchDB.deleteMultiple(tabList).then(function() {
                    alert("The products are deleted successfuly");
                    // Reloasing the product list page
                    $state.transitionTo($state.current, $stateParams, {
                        reload: true,
                        inherit: false,
                        notify: true
                    });
                });

            }
        };

        // Checking all products in the products table
        $scope.checkAll = function() {
            angular.forEach($scope.items, function(item) {
                item.delete = $scope.selectAll;
            });
        };

    })
    
    // User login controller
    .controller("LoginController", function($scope, $rootScope, $state, $stateParams, $pouchDB) {

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
                    alert("Authentication Error");
                }
            }, function(error) {
                console.log("ERROR -> " + error);
            });
        }
    })

    // The app service containing the database functions
    .service("$pouchDB", ["$rootScope", "$q", function($rootScope, $q) {

        var database;
        var changeListener;

        // Setting the database defined
        this.setDatabase = function(databaseName) {
            database = new PouchDB(databaseName);
        }

        // Listening for any change and updating the list
        this.startListening = function() {

            changeListener = database.changes({
                live: true,
                include_docs: true
            }).on("change", function(change) {
                if (!change.deleted) {
                    $rootScope.$broadcast("$pouchDB:change", change);
                } else {
                    $rootScope.$broadcast("$pouchDB:delete", change);
                }
            });
        }

        // Adding and Updating product
        this.save = function(jsonDocument) {
            // Creating the promise
            var deferred = $q.defer();

            // Checking about the id is sending
            if (!jsonDocument._id) {
                // Creating new product
                database.post(jsonDocument).then(function(response) {
                    deferred.resolve(response);
                }).catch(function(error) {
                    deferred.reject(error);
                });
            } else {
                // Updating an existing product
                database.put(jsonDocument).then(function(response) {
                    deferred.resolve(response);
                }).catch(function(error) {
                    deferred.reject(error);
                });
            }

            // Returnin the promise 
            return deferred.promise;
        }

        // Deleting of single document by _id and _rev
        this.delete = function(documentId, documentRevision) {
            return database.remove(documentId, documentRevision);
        }

        // Deleting multiple product (Bulk)
        this.deleteMultiple = function(tab) {
            return database.bulkDocs(tab);
        }

        // Querying the document by the _id
        this.get = function(documentId) {
            return database.get(documentId);
        }

        // Creating new user with sending Parameters
        this.create = function(params) {
            return database.put(params);
        }
    }]);