const imgur = "https://imgur.com/";
var MYUSER = "eumomentan";
var KEY = "s";

$(document).ready(function() {
    $("#log").append(`<input type="text" id="userfield" class="gonnaDissapare" placeholder="Username">`);
    $("#log").append(`<input type="password" id="pass" placeholder="Password" class="gonnaDissapare">`);
    $("#log").append(`<input type="button" value="LogIn" id="login" class="gonnaDissapare">`);
    $("#log").append(`<input type="button" value="SignUp" id="signup" class="gonnaDissapare">`);


    $("#login").click(function(){
        let user = $("#userfield").val();
        let pass = $("#pass").val();
        $.ajax({
            contentType: 'application/json',
            data: `{"user":"${user}","password":"${pass}"}`,
            dataType: 'json',
            processData: false,
            type: 'POST',
            url: "http://localhost:8080/login",
            success: function(data) {
                if (data.password) {
                    KEY = data.password;
                    MYUSER = user;

                    sessionStorage.setItem("username", MYUSER);
                    sessionStorage.setItem("key", KEY);

                    $(".gonnaDissapare").hide();
                    $("#username").html(MYUSER);
                    main(`http://localhost:8080/getPosts/${KEY}`);
                } else {
                    $("#feed").html("NOPE");
                }
            }
        });
    });

    $("#signup").click(function() {
        $("#login").hide();
        $("#log").append(`<input type="password" id="pass2" placeholder="Repeat password" class="gonnaDissapare">`);
        $(this).hide();
        $("#log").append(`<input type="button" value="SignUp" id="signup2" class="gonnaDissapare">`);
        $("#signup2").click(function() {
            let user = $("#userfield").val();
            let pass = $("#pass").val();
            console.log("yay");
            $.ajax({
                contentType: 'application/json',
                data: `{"user":"${user}","password":"${pass}","profile_pic":"*"}`,
                dataType: 'json',
                processData: false,
                type: 'POST',
                url: "http://localhost:8080/create"
            });
        });
    });
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
