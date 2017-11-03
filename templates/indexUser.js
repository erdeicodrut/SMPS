const imgur = "https://imgur.com/";
var MYUSER = "eumomentan";
var KEY = "s";

$(document).ready(function() {
	MYUSER = sessionStorage.getItem("username");
	KEY = sessionStorage.getItem("key");
	main("http://localhost:8080/user/{{u}}");
});

$(window).ready(function () {
    if (window.innerWidth < 1080) {
        $("#feed").addClass("mobile");
        $("#feed").removeClass("web");
    } else {
        $("#feed").addClass("web");
        $("#feed").removeClass("mobile");
    }
});