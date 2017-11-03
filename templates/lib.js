function main(link) {
    $.getJSON(link, function (data) {
        console.log("sa");
        for (var i = 0; i < data.length; i++) {
            console.log(data[i]);
            $("#feed").append(createItem(
                data[i].id, 
                imgur + data[i].photo, 
                data[i].user, 
                imgur + data[i].photo)
            );

            fetchLikes(data[i])
            fetchComments(data[i])

            
            $(`#likeButton${data[i].id}`).click(function() {
                var id = parseInt($(this).attr('id').split('likeButton')[1]);

                if ($(this).val() == "Like") {
                    $.get( `http://localhost:8080/like/${id}/${MYUSER}`, function( data ) {
                        console.log(`liked post nr ${id}`);
                    });
                    $(`#post${id} #numOfLikes`).html(parseInt($(`#post${id} #numOfLikes`).html()) + 1);
                    $(this).val("Dislike");
                } else {
                    $.get( `http://localhost:8080/unlike/${id}/${MYUSER}`, function( data ) {
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
                        url: "http://localhost:8080/comment"
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
    if (find(MYUSER, data.likes))
        like = "Dislike";
    else 
        like = "Like"; 

    $(`#feed #post${data.id} .commentContainer`).append(
                `<div class="likecontainer"><input class="likebutton"
type="button" value="${like}" id="likeButton${data.id}" class="likeButton">
                <div id="numOfLikes">${data.likes.length}</div> likes</div>`);
}

function fetchComments(data) {
    for (var j = 0; j < data.comments.length; j++) {
                    console.log(data.comments[j])
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
            <div class="name">${username}</div>
        </div>
            <img src="${pic}" class="pic">
            <ul class="commentContainer">
            </ul>
            <div class="delim"></div>
            <input placeholder="Write comment here" type="text" id="comment${i}" class="commentInput"/>
    </li>`);
}

function createComment(user, comment) {
    let userLink = `http://localhost:8080/getUser/${user}`;
    return `<li class="comment"><b><a href="${userLink}">${user}</a> </b>${comment}</li>`
}


// <input id="browse-image" type="file" accept="image/png,image/jpeg" onchange="previewImage()" required>
function saveCardImage() {
    let image;
    let input = $("#browse-image")[0];
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
                image = response.data.link.split("http://i.imgur.com/")[1];
            } else {
                image = "*";
            }
        }
    });
}
