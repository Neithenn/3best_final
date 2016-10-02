// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ionic-datepicker', 'ngCordova','ngCordovaOauth'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider){

  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'Login'

  })
  .state('thirdday',{
    url: '/thirdday',
    templateUrl: 'templates/thirdday.html',
    controller: 'Notes1'
  })
  .state('secondday',{
    url: '/thirdday',
    templateUrl: 'templates/secondday.html',
    controller: 'Notes2',
    params: {
      'note3': 'default'
    }
  })
  .state('firstday',{
    url: '/thirdday',
    templateUrl: 'templates/firstday.html',
    controller: 'Notes3',
    params: {
      'note3': 'default',
      'note2': 'default' 
    }
  })
  .state('list',{
    url: '/listnotes',
    templateUrl: 'templates/listnotes.html',
    controller: 'ListNotes'
  })
  .state('singlenote',{
    url: '/singlenote',
    templateUrl: 'templates/singlenote.html',
    controller: 'NoteView'
  })

  $urlRouterProvider.otherwise('/login');
})




.controller('Login', function($scope, $http, userDataFactory, $cordovaOauth, $state, popUps){



$scope.loginGoogle = function(){

$cordovaOauth.google("10731361558-h3ub4o7igmkijiike86aubporrm79f2c.apps.googleusercontent.com", ["email", "profile"]).then(function(result) {


$http.get("https://www.googleapis.com/plus/v1/people/me", {params: {access_token: result.access_token }})
       .then(function(res) {
        $scope.details = res.data;

         sendUser($scope.details.emails[0].value, $scope.details.id, 'Google');

       }, function(error) {
           alert("Error: " + error);
       });

        }, function(error) {
                console.log(error);
                popUps.emailUsed();

        });
    

}

$scope.loginFacebook = function(){

$cordovaOauth.facebook("1063570090358564", ["email", "public_profile"]).then(function(result) {

   $http.get("https://graph.facebook.com/v2.2/me", {params: {access_token: result.access_token, fields: "name,email", format: "json" }}).then(function(result) {
        var name = result.data.name;

        sendUser(result.data.email, result.data.id, 'Facebook');

         }, function(error) {
           alert("Error: " + error);
       });

}, function(error) {
                console.log(error);
                popUps.emailUsed();

        });
}


$scope.user = {};
      $scope.submit = function(){

        sendUser($scope.user['email'], $scope.user['password']);
      };

      function sendUser(email, password, provider){

        var json = '{"user": {"email": "' + email + '", "password": "'+ password +'", "provider": "'+ provider +'"}}';
        console.log(json);
        $http({
            method : "POST",
            url: "http://stormy-castle-48703.herokuapp.com/api/v1/checkuser",
            data: json
          }).then ( function mySucces(response){
           
              userDataFactory.nuevoUsuario(response.data.user[0].id, response.data.user[0].email);
              userDataFactory.addNotes(response.data.notes);
              userDataFactory.addDate(response.data.date);
              console.log(response.data.notes);
                console.log(response.data.date);
              $state.go('thirdday');

          }, function myError(response){
            console.log(response);
               popUps.errorApi();
          });
      }
})

.controller('Notes1',function($scope, userDataFactory, $state, popUps){

  var user_session = this;
  var sameday;

  $scope.note = {};
  $scope.date = userDataFactory.getDate();
  sameday = userDataFactory.sameDayNote();

  if (sameday != 0){
    $scope.note.thirdnote = sameday.note3;
  }

  $scope.data = userDataFactory.getUsuario();

  if (!$scope.data){
      $state.go('login');
  }

    $scope.nextnote = function(){
      if ($scope.note.thirdnote){
        $state.go('secondday', {note3: $scope.note.thirdnote});  
      }else{

        //Show error 'must fill something!'
        popUps.emptyNote();
      }
      
    };

    $scope.golist = function (){
        //$scope.notes = userDataFactory.getNotes();
      $state.go('list');

    };

})

.controller('Notes2',function($scope, userDataFactory, $state, $stateParams){

  var user_session = this;
  var note3 = $stateParams.note3;
  var sameday;

  $scope.note = {};
  $scope.date = userDataFactory.getDate();

  $scope.data = userDataFactory.getUsuario();
  sameday = userDataFactory.sameDayNote();

  if (sameday != 0){
    $scope.note.secondnote = sameday.note2;
  }

  if (!$scope.data){
      $state.go('login');
  }

    $scope.nextnote = function(){
      
      if ($scope.note.secondnote){
        $state.go('firstday', {note3: note3, note2: $scope.note.secondnote});  
      }else{
         popUps.emptyNote();
      }
      
    };

    $scope.golist = function (){
        //$scope.notes = userDataFactory.getNotes();
      $state.go('list');

    };

})

.controller('Notes3',function($scope, $http, userDataFactory, $state, $stateParams, popUps){

  var user_session = this;
  var  sameday;

  $scope.notes = {
    note3: $stateParams.note3,
    note2: $stateParams.note2
  }
  $scope.date = userDataFactory.getDate();
  $scope.data = userDataFactory.getUsuario();
  sameday = userDataFactory.sameDayNote();

  if (sameday != 0){
    $scope.notes.note1 = sameday.note1;
  }

  if (!$scope.data){
      $state.go('login');
  }

    $scope.saveday = function(){

      if ($scope.notes.note1){

           if (sameday){
              //UPDATE
            var json = '{"note": {"note1": "' + $scope.notes.note1 + '", "note2": "'+$scope.notes.note2+'", "note3": "'+$scope.notes.note3+'", "id_user": '+$scope.data[0]+',"id": '+sameday.id+'}}';
            console.log(json);
            $scope.notes.created_at = new Date($scope.date);
            console.log($scope.notes.created_at);

                  $http({
                        method : "POST",
                        url: "http://stormy-castle-48703.herokuapp.com/api/v1/updatenotes",
                        data: json
                      }).then ( function mySucces(response){
                       
                       $scope.notes.id = sameday.id;
                        //updatenotes
                        userDataFactory.updateNote($scope.notes);

                          $state.go('list');

                      }, function myError(response){
                        console.log('error');
                        popUps.errorApi();
                      });
           
           }else{
              //CREATE

            var json = '{"note": {"note1": "' + $scope.notes.note1 + '", "note2": "'+$scope.notes.note2+'", "note3": "'+$scope.notes.note3+'", "id_user": '+$scope.data[0]+'}}';
            //"id_user": '+$scope.data[0]+'}}
            console.log(json);
            $scope.notes.created_at = new Date($scope.date);
            console.log($scope.notes.created_at);

            $http({
                  method : "POST",
                  url: "http://stormy-castle-48703.herokuapp.com/api/v1/newnotes",
                  data: json
                }).then ( function mySucces(response){
                 

                  userDataFactory.newNote($scope.notes);

                    $state.go('list');

                }, function myError(response){
                  console.log('error');
                  popUps.errorApi();
                });
              }
          }else{

             popUps.emptyNote();
          }
      
    };

    $scope.golist = function (){
        //$scope.notes = userDataFactory.getNotes();
      $state.go('list');

    };

})

.controller('ListNotes', function($scope, userDataFactory, $state, ionicDatePicker){

$scope.notes = userDataFactory.getNotes();
console.log($scope.notes);


 var ipObj1 = {
      callback: function (val) {  //Mandatory
        var i;
        var arLength;
        var aux_date;

        $scope.message = '';
        $scope.notepicker = '';
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
        $scope.datepicker = new Date(val);
        //Lleno un scope con el nota buscada. search en scope.notes
        arLength = $scope.notes.length;
        for (i = 0; i < arLength; i++){

        aux_date = new Date($scope.notes[i].created_at);
        if (aux_date.getDate() == $scope.datepicker.getDate() && aux_date.getMonth() == $scope.datepicker.getMonth()
            && aux_date.getFullYear() == $scope.datepicker.getFullYear()){
             $scope.notepicker = $scope.notes[i];
          }

        }
        
        if (!$scope.notepicker){
          $scope.message = 'Didn\'t find anything.';
        }

      }};

      //$scope.fecha = ipObj1;

  $scope.openDatePicker = function(){
      ionicDatePicker.openDatePicker(ipObj1);
    };

  console.log($scope.notes);

$scope.singleview = function(note){
  $scope.note_date = note;
  userDataFactory.singlenote(note);
  $state.go('singlenote');

}

$scope.start = function(){

   $state.go('thirdday');
}
})


.controller('NoteView', function($scope, userDataFactory, $state){

  $scope.note_date = userDataFactory.getSingleNote();
  console.log($scope.note_date);


})


.factory("userDataFactory", function(){

    var user;
    var user_notes;
    var single_note;
    var current_date;
    
    var interfaz = {
      getUsuario: function(){
        return user;
      },
      getNotes: function(){
        return user_notes;
      },
      getSingleNote: function(){
        return single_note;
      },
      getDate: function(){
        return current_date;
      },
      sameDayNote: function(){
        var len = user_notes.length;
        var i;
        var date1 = new Date(current_date);
        var date2;

        for (i = 0; i < len; i++){
          date2 =  new Date(user_notes[i].created_at);
          if (date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth()
            && date1.getFullYear() == date2.getFullYear()){
            break;
          }
        }

        if (i >= len) {
          return 0;
        }else{
           return user_notes[i];
        }

      },
      nuevoUsuario: function(userId, email){
          user = [userId, email];
      },
      addNotes: function(notes){
          user_notes = notes;
      },
      singlenote : function(note){
          single_note = note;
      },
      newNote: function(note){
        user_notes.push(note);
      },
      updateNote: function(note){

        var len = user_notes.length;
        var i;
        for (i = 0; i < len; i++){
          if (user_notes[i].id == note.id){
            user_notes[i].note1 = note.note1;
            user_notes[i].note2 = note.note2;
            user_notes[i].note3 = note.note3;
          }
        }

        console.log(user_notes);
      },
      addDate: function(date){
        current_date = date;
      }
    }

    return interfaz;
})


.factory("popUps", function($ionicPopup){

    var interfaz = {
      emptyNote: function(){

          var alertPopup = $ionicPopup.alert({
         title: 'Wait a minute!',
         template: 'Something must have happened to you, cmon think!'
       });

    alertPopup.then(function(res) {
     console.log('Popup worked well');
   });
    },
    emailUsed: function(){
      var alertPopup = $ionicPopup.alert({
         title: 'Wow! an error!',
         template: 'Something wrong just happened, try to log in using another provider'
       });

    alertPopup.then(function(res) {
     console.log('Popup worked well');
   });

    },
    errorApi: function(){
          var alertPopup = $ionicPopup.alert({
         title: 'Uhmm that is weird',
         template: 'We couldn\'t connect to server, try again later!'
       });

    alertPopup.then(function(res) {
     console.log('Popup worked well');
   });

    }

  }

  return interfaz;



})
