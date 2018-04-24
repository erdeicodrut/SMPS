const local = "{{local}}";


function main(link) {
    $("#upload").toggle();
    $.getJSON(link, function (data) {
        console.log(data)
        for (var i = data.length - 1; i >= 0; i--) {
            console.log(data[i]);
            $("#feed").append(createItem(
                data[i].id, 
                imgur + data[i].profile_pic,
                data[i].user, 
                imgur + data[i].photo)
            );

            fetchLikes(data[i])
            fetchComments(data[i])

            
            $(`#likeButton${data[i].id}`).click(function() {
                var id = parseInt($(this).attr('id').split('likeButton')[1]);

                if ($(this).val() == "Like") {
                    $.get( `http://{{local}}/like/${id}/${MYUSER}`, function( data ) {
                        console.log(`liked post nr ${id}`);
                    });
                    $(`#post${id} #numOfLikes`).html(parseInt($(`#post${id} #numOfLikes`).html()) + 1);
                    $(this).val("Dislike");
                } else {
                    $.get( `http://{{local}}/unlike/${id}/${MYUSER}`, function( data ) {
                        console.log(`liked post nr ${id}`);
                    });
                    $(`#post${id} #numOfLikes`).html(parseInt($(`#post${id} #numOfLikes`).html()) - 1);
                    $(this).val("Like");
                }
            });

            $(`#comment${data[i].id}`).keypress(function(e) { 
                if (e.keyCode == 13) {
                    var id = parseInt($(this).attr('id').split('comment')[1]);

                    console.log($(this).val());

                    $.ajax({
                        contentType: 'application/json',
                        data: `{"text":"${$(this).val()}","post_id":${id},"user":"${MYUSER}"}`,
                        dataType: 'json',
                        processData: false,
                        type: 'POST',
                        url: "http://{{local}}/comment"
                    });

                    $(`#feed #post${id} .commentContainer`)
                                .append(createComment(
                                    MYUSER,
                                    $(this).val())
                                );
                                $(this).val("");
                }
            });

            
        }
    });
}


function find(who, where) {
    for (let i = where.length; i >= 0; i--) {
        if (where[i] == who) {
            return true;
        }
    }
    return false;
}

function fetchLikes(data) {
    try {
        if (find(MYUSER, data.likes))
            like = "Dislike";
        else
            like = "Like";
        }
    catch (e) {
        if (data.likes == MYUSER) {
            like = "Dislike";
        }
        else {
            like = "Like";
        }
    }

    $(`#feed #post${data.id} .commentContainer`).append(
                `<div class="likecontainer"><input class="likebutton"
type="button" value="${like}" id="likeButton${data.id}" class="likeButton">
                <div id="numOfLikes">${data.likes.length}</div> likes</div>`);
}

function fetchComments(data) {
    for (var j = 0; j < data.comments.length; j++) {
                    $(`#feed #post${data.id} .commentContainer`)
                        .append(createComment(
                            data.comments[j].from_user,
                            data.comments[j].text)
                        );
    }
}


function createItem(i, profilepic, username, pic) {
    // language=HTML
    return $(`
    <li id="post${i}" class="feedItem">
        <div class="PN">
            <img class="profilepic" src="${profilepic}">
            <a href="http://{{local}}/getUser/${username}" class="name">${username}</a>
        </div>
            <img src="${pic}" class="pic">
            <ul class="commentContainer">
            </ul>
            <div class="delim"></div>
            <input placeholder="Write comment here" type="text" id="comment${i}" class="commentInput"/>
    </li>`);
}

function createComment(user, comment) {
    let userLink = "http://{{local}}/getUser/" + user;
    return `<li class="comment"><b><a href="${userLink}">${user}</a> </b>${comment}</li>`
}


function previewImage(myID, id) {
        let input = $("#" + myID)[0];
        if (input.files && input.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {
                $("#" + id).attr("src", e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

function saveCardImage() {
    let image;
    let input = $("#browse-image")[0];
    let description;
    if (!(input.files && input.files[0])) return;

    $.ajax({
        url: "https://api.imgur.com/3/image",
        type: "post",
        headers:{ Authorization: 'Client-ID 456787c11f9dba5' },
        data: { image: $("#image-preview").attr("src").split(",")[1] },
        dataType: 'json',
        success: function(response) {
            if(response.success) {
                console.log(response.data.link);
                image = response.data.link.split("https://i.imgur.com/")[1];
            } else {
                image = "*";
            }

            description = $("#descriptionText").val() || "*";

            let nextReq = `{"user":"${MYUSER}","photo":"${image}","description":"${description}"}`;
            console.log(nextReq);


             $.ajax({
                contentType: 'application/json',
                data: nextReq,
                dataType: 'json',
                processData: false,
                type: 'POST',
                url: "http://{{local}}/post",
                success: function(response) {
                    if(response.success) {
                        console.log(response.data.link);
                        image = response.data.link.split("http://i.imgur.com/")[1];
                    } else {
                        image = "*";
                    }
                }
            });

            location.reload();
        }
    });


}

