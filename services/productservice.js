// The app service containing the database functions
app.service("$pouchDB", ["$rootScope", "$q", function($rootScope, $q) {

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

    // Querying the document by the _id
    this.getAll = function() {
        return database.allDocs({
          include_docs: true,
          descending: true
        });
    }

    // Creating new user with sending Parameters
    this.create = function(params) {
        return database.put(params);
    }
}]);
