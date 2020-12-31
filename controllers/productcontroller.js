// Product management controller
app.controller("ProductController", function($scope, $rootScope, $state, $stateParams, $pouchDB, toaster) {

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

        // Checking if _id and _rev are sent
        if ($stateParams.documentId) {
            //Addig _id and _rev to the document for the update
            jsonDocument["_id"] = $stateParams.documentId;
            jsonDocument["_rev"] = $stateParams.documentRevision;
        }
        $pouchDB.save(jsonDocument).then(function(response) {
              // Redirection to the product list page
              $state.go("list");
              //Success message
              toaster.success("Success", "The product recorded successfuly");

        }, function(error) {
          // Error message
          toaster.error("Error", error);
        });
    }

    // Deleting the product
    $scope.delete = function(id, rev) {
        // Asking the user for confirmation
        if (confirm("Do you want to delete this product ?")) {
            // Calling the function of deleting the product
            $pouchDB.delete(id, rev).then(function() {
                //Success message
                toaster.success("Success", "The product deleted successfuly");
                // Reloasing the product list page
                $state.transitionTo($state.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            }, function(error) {
              // Error message
              toaster.error("Error", error);
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
        if (confirm("Do you want to delete this products ?")) {
            // Calling the function of multi products deleting (Bulk Delete)
            $pouchDB.deleteMultiple(tabList).then(function() {
                //Success message
                toaster.success("Success", "The products are deleted successfuly");
                // Reloasing the product list page
                $state.transitionTo($state.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            }, function(error) {
              // Error message
              toaster.error("Error", error);
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
