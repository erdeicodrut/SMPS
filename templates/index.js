const imgur = "https://imgur.com/";
var MYUSER = "eumomentan";
var KEY = "s";

$(document).ready(function() {
    $("#uploadDiv").hide();
    MYUSER = sessionStorage.getItem("username");
    KEY = sessionStorage.getItem("key");

    if (MYUSER !== null && KEY !== null) {
        $(".gonnaDissapare").hide();
        $("#username").html(MYUSER);
        $("#username").attr("href", "http://localhost:8080/getUser/" + MYUSER);
        main("http://localhost:8080/getPosts/" + KEY);
    } else {
        $("#log").append(`<input type="text" id="userfield" class="gonnaDissapare" placeholder="Username">`);
        $("#log").append(`<input type="password" id="pass" placeholder="Password" class="gonnaDissapare">`);
        $("#log").append(`<input type="button" value="LogIn" id="login" class="gonnaDissapare">`);
        $("#log").append(`<input type="button" value="SignUp" id="signup" class="gonnaDissapare">`);
    }

    $("#upload").on("click", function() {
        $("#feedItem").hide();
        $("#uploadDiv").show();
    });

    // Alex
    $(".upload-image").click(function() {
        $("#browse-image").click();
    });

    $("#browse-image").change(function() {
        $(".upload-image").hide();
        $(".postToPost").show();
        previewImage('browse-image', 'image-preview');
    });


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
                    main("http://localhost:8080/getPosts/" + KEY);
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

        $("#log").append(`<input id="browse-image-singup" type="file" accept="image/png,image/jpeg" onchange="previewImage('browse-image-singup', 'profilepicpreview')" class="gonnaDissapare" required>`);
        $("#log").append(`<img id="profilepicpreview"  class="gonnaDissapare" src=""/>`);
        $("#signup2").click(function() {
            let user = $("#userfield").val();
            let pass = $("#pass").val();
            console.log("yay");

            let image;
            let input = $("#browse-image-singup")[0];
            if (!(input.files && input.files[0])) return;

            $.ajax({
                url: "https://api.imgur.com/3/image",
                type: "post",
                headers:{ Authorization: 'Client-ID 456787c11f9dba5' },
                data: { image: $("#profilepicpreview").attr("src").split(",")[1] },
                dataType: 'json',
                success: function(response) {
                    if(response.success) {
                        console.log(response.data.link);
                        image = response.data.link.split("https://i.imgur.com/")[1];
                    } else {
                        image = "*";
                    }

                    $.ajax({
                        contentType: 'application/json',
                        data: `{"user":"${user}","password":"${pass}","profile_pic":"${image}"}`,
                        dataType: 'json',
                        processData: false,
                        type: 'POST',
                        url: "http://localhost:8080/create"
                    });
                }
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
