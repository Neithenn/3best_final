// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase'])

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

  //$urlRouterProvider.otherwise('/login');
})


.controller('Login', function($scope, Auth, $http, userDataFactory, $state){

$scope.user = {};
      $scope.submit = function(){

        var json = '{"user": {"email": "' + $scope.user['email'] + '", "password": "'+$scope.user['password']+'"}}';
        console.log(json);
        $http({
            method : "POST",
            url: "http://localhost:3000/api/v1/checkuser",
            data: json
          }).then ( function mySucces(response){
           
              userDataFactory.nuevoUsuario(response.data.user[0].id, response.data.user[0].email);
              userDataFactory.addNotes(response.data.notes);
              userDataFactory.addDate(response.data.date);
              console.log(response.data.notes);
                console.log(response.data.date);
              $state.go('thirdday');

          }, function myError(response){
            console.log('error');
          });

      };
})

.controller('Notes1',function($scope, userDataFactory, $state){

  var user_session = this;

  $scope.note = {};
  $scope.date = userDataFactory.getDate();

  $scope.data = userDataFactory.getUsuario();

  if (!$scope.data){
      $state.go('login');
  }

    $scope.nextnote = function(){
      if ($scope.note.thirdnote != ""){
        $state.go('secondday', {note3: $scope.note.thirdnote});  
      }else{

        //Show error 'must fill something!'
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
  $scope.note = {};
  $scope.date = userDataFactory.getDate();

  $scope.data = userDataFactory.getUsuario();

  if (!$scope.data){
      $state.go('login');
  }

    $scope.nextnote = function(){
      
      if ($scope.note.secondnote != ""){
        $state.go('firstday', {note3: note3, note2: $scope.note.secondnote});  
      }
      
    };

    $scope.golist = function (){
        //$scope.notes = userDataFactory.getNotes();
      $state.go('list');

    };

})

.controller('Notes3',function($scope, $http, userDataFactory, $state, $stateParams){

  var user_session = this;

  $scope.notes = {
    note3: $stateParams.note3,
    note2: $stateParams.note2
  }
  $scope.date = userDataFactory.getDate();
  $scope.data = userDataFactory.getUsuario();

  if (!$scope.data){
      $state.go('login');
  }

    $scope.saveday = function(){
      
      if ($scope.notes.note1 != ''){

        var json = '{"note": {"note1": "' + $scope.notes.note1 + '", "note2": "'+$scope.notes.note2+'", "note3": "'+$scope.notes.note3+'", "id_user": 1}}';
        //"id_user": '+scope.data[0]+'}}
        console.log(json);
        $http({
              method : "POST",
              url: "http://localhost:3000/api/v1/newnotes",
              data: json
            }).then ( function mySucces(response){
             

              userDataFactory.newNote($scope.notes);

                $state.go('list');

            }, function myError(response){
              console.log('error');
            });
          }else{

            //COMPLETAR NOTA 1
          }
      
    };

    $scope.golist = function (){
        //$scope.notes = userDataFactory.getNotes();
      $state.go('list');

    };

})

.controller('ListNotes', function($scope, userDataFactory, $state){

$scope.notes = userDataFactory.getNotes();

  console.log($scope.notes);

$scope.singleview = function(note){
  $scope.note_date = note;
  userDataFactory.singlenote(note);
  $state.go('singlenote');

}
  //console.log($scope.notes[0].note1);
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
      addDate: function(date){
        current_date = date;
      }
    }

    return interfaz;
})
