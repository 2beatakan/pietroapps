/**
 * Created by raul on 1/5/16.
 */

angular.module('controllers').controller('SignUpController', function ($scope, $cordovaGeolocation, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.days = [];
        $scope.months = [
            { value: 1, text: "Ocak" },
            { value: 2, text: "Şubat" },
            { value: 3, text: "Mart" },
            { value: 4, text: "Nisan" },
            { value: 5, text: "Mayıs" },
            { value: 6, text: "Haziran" },
            { value: 7, text: "Temmuz" },
            { value: 8, text: "Ağustos" },
            { value: 9, text: "Eylül" },
            { value: 10, text: "Ekim" },
            { value: 11, text: "Kasım" },
            { value: 12, text: "Aralık" }
        ];
        $scope.years = [];
        $scope.user = {};
        // $scope.user = {
        //     email: "pietro@gmail.com",
        //     password: "123123123",
        //     name: "Pietro",
        //     full_name: "PietroApps",
        //     dob: "03-15-1996",
        //     gender: "Erkek",
        //     looking_to: "Sohbet",
        //     age: 22,
        //     month: "3",
        //     day: "15",
        //     year: "1996"
        // };
        $scope.wrongCredentials = false;

        initComboboxes();
    }

    function initComboboxes() {
        for (var i = 1; i <= 31; i++) {
            $scope.days.push(i);
        }
        for (i = 1998; i >= 1935; i--) {
            $scope.years.push(i);
        }
    }

    $scope.checkAccountAvailability = function () {
        if (!$scope.validateEmail($scope.user.email)) {
            $scope.showMessage("Please enter a valid email address!", 2500);
            return;
        }
        mainFactory.checkEmailAvailability({"email": $scope.user.email}).then(successCheckEmail, errorCheckEmail);
    };

    function successCheckEmail(response) {
        if (!response.data.success) {
            $scope.wrongCredentials = true;
            $scope.showMessage(response.data.error, 3000);
        }
        else {
            if (response.data.existEmail) {
                $scope.wrongCredentials = true;
                $scope.showMessage("Bu e-posta kullanılıyor!", 2500);
            }
            else {
                $scope.wrongCredentials = false;
            }
        }
    }

    function errorCheckEmail(response) {
        $scope.wrongCredentials = true;
        $scope.showMessage(response.data ? response.data.error : "Sunucu Bağlantı Hatası", 3000);
    }

    $scope.signUp = function() {
        if ($scope.wrongCredentials) {
            $scope.showMessage("Bu e-posta kullanılıyor!", 2500);
            return;
        }
        if (!$scope.user.email) {
            $scope.showMessage("E-posta boş bırakılmaz!", 2500);
            return;
        }
        if (!$scope.validateEmail($scope.user.email)) {
            $scope.showMessage("Geçerli bir e-posta girin!", 2500);
            return;
        }
        if (!$scope.user.password) {
            $scope.showMessage("Şifre boş bırakılmaz!", 2500);
            return;
        }
        if (!$scope.user.name) {
            $scope.showMessage("İsim boş bırakılmaz!", 2500);
            return;
        }
        if (!$scope.user.gender) {
            $scope.showMessage("Cinsiyet boş bırakılmaz!", 2500);
            return;
        }
        if (!$scope.user.day || !$scope.user.month || !$scope.user.year) {
            $scope.showMessage("Doğum günü boş bırakılmaz!", 2500);
            return;
        }
        $scope.showMessageWithIcon("Hesap oluşturuluyor...");
        $scope.getCurrentLocation().then(successGetLocation, $scope.errorGetLocation);
    };

    function successGetLocation(position) {
        geocodeLatLng(position.coords.latitude, position.coords.longitude);
    }

    function geocodeLatLng(lat, long) {
        var geocoder = new google.maps.Geocoder;
        var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
        geocoder.geocode({'location': latlng}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    var userObj = {
                        "E-posta": $scope.user.email,
                        "Şifre": $scope.user.password,
                        "İsim": $scope.user.name,
                        "Soyisim": "",
                        "AGY": $scope.user.month + "-" + $scope.user.day + "-" + $scope.user.year,
                        "Cinsiyet": $scope.user.gender,
                        "Yaş": $scope.calculateAge($scope.user),
                        "Lokasyon": results[0].formatted_address.replace('EE. UU.', 'USA'),
                        "Resim": "'{1.jpg}'",
                        "Dil": "'{English}'",
                        "coords": latlng,
                        "looking_to": $scope.user.looking_to
                    };
                    console.log(userObj);
                    mainFactory.createAccount(userObj).then(successCallBack, errorCallBack);
                } else {
                    $scope.showMessage('Sonuç bulunamadı', 2500);
                }
            } else {
                $scope.showMessage('Geocoder nedeniyle başarısız oldu: ' + status, 2500);
            }
        });
    }

    function successCallBack(response) {
        $scope.hideMessage();
        $scope.setUserToLS({ email: $scope.user.email, password: $scope.user.password });
        User.setToken(response.data.token);
        response.data.user = $scope.parseDataFromDB(response.data.user);
        User.setUser(response.data.user);
        $scope.goToPage('add_photos');
    }

    function errorCallBack(response) {
        $scope.hideMessage();
        console.log(response);
        $scope.showMessage(response.data.error, 3000);
    }

    init();
});