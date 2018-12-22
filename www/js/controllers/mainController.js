angular.module('controllers', []).controller('AppCtrl', function($scope, $rootScope, socket, User, GenericController, mainFactory) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    function init() {
        GenericController.init($scope);
        $scope.user = User.getUser();
        $scope.getNotifications();
        $scope.getNumberOfMsgAndLikes();
    }

    $scope.goToSettings = function (ev) {
        ev.stopPropagation();
        $scope.goToPage('app/settings');
    };
    
    $scope.getNumberOfMsgAndLikes = function () {
        mainFactory.getMessagesAndLikesTotal().then(getNumberOfMsgAndLikesSuccess, getNumberOfMsgAndLikesError);
    };

    function getNumberOfMsgAndLikesSuccess(response) {
        $scope.user.totalMsgs = response.data.totalMsgs;
        $scope.user.totalLikes = response.data.totalLikes;
    }

    function getNumberOfMsgAndLikesError(response) {
        console.log(response.data.error);
        $scope.showMessage(response.data.error, 2000);
    }

    socket.on('connect', function() {
        socket.emit('bildirimlere abone ol', $scope.user.id);

        socket.on('Yeni mesaj ', function (data) {
            data.msg = "Sana bir mesaj yolladı!";
            data.is_message = true;
            $rootScope.notifications.unread_msg++;
            $scope.user.totalMsgs++;
            $scope.showNotification(data);
        });

        socket.on('Yeni eşleşme', function (data) {
            data.msg = "Seni beğendi!";
            $rootScope.notifications.new_matches++;
            $scope.user.totalLikes++;
            $scope.showNotification(data);
        });

        socket.on('Yeni ziyaretçi', function (data) {
            data.msg = "Şimdi profilini görüntülüyor!";
            $rootScope.notifications.new_visitors++;
            $scope.showNotification(data);
        });
    });

    init();
});
