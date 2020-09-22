var currentUserKey = ""
var chatKey = ""

document.addEventListener("keydown", function (key) {
    if (key.which === 13) {
        MessageSent()
    }
})


function toHaveChatBox(friendKey, friendName) {
    var friendList = { friendId: friendKey, userId: currentUserKey }

    var ref = firebase.database().ref("friend-list")

    var flag = false

    ref.on('value', function (friends) {
        friends.forEach(function (data) {
            var user = data.val()
            if ((user.friendId === friendList.friendId && user.userId === friendList.userId) || (user.friendId === friendList.userId && user.userId === friendList.friendId)) {
                flag = true
                chatKey = data.key
            }
        })
        if (flag === false) {
            chatKey = firebase.database().ref('friend-list').push(friendList, function (error) {
                if (error) {
                    alert(error)
                }
                else {
                    document.getElementById("chat-box").removeAttribute("style")
                    document.getElementById("starting").setAttribute("style", "display:none")
                    document.getElementById('contacts').classList.add("d-none", "d-md-block")
                }
            }).getKey()

        }
        else {
            document.getElementById("chat-box").removeAttribute("style")
            document.getElementById("starting").setAttribute("style", "display:none")
            document.getElementById('contacts').classList.add("d-none", "d-md-block")
        }

        document.getElementById("identity").innerHTML = friendName

        document.getElementById("card-body").innerHTML = ""

        document.getElementById("texting").value = ""
        document.getElementById("texting").focus()

        loadPreviousChats(chatKey);
    })

}

function loadPreviousChats(chatKey) {
    var ref = firebase.database().ref("messagesOnChattings").child(chatKey)

    ref.on('value', function (chats) {
        var message = ''
        chats.forEach(function (data) {
            var chat = data.val()
            var date_time = chat.dateTime.split(",")
            if (chat.userId !== currentUserKey) {
                message += `<div class="row">
                <div class="col-6 col-sm-7 col-md-7">
                    <p class="r-message">${chat.msg}
                    <span class="r-time" title="${date_time[0]}">${date_time[1]}</span>
                    </p>
                </div>
            </div>`
            }
            else {
                message += `<div class="row justify-content-end">
                <div class="col-6 col-sm-7 col-md-7">
                    <p class="s-message float-right">${chat.msg}
                        <span class="s-time float-right" title="${date_time[0]}">${date_time[1]}</span>
                    </p>
                </div>
            </div>
            </div>`
            }


        })
        document.getElementById('card-body').innerHTML = message
        document.getElementById('card-body').scrollTop = document.getElementById('card-body').scrollHeight
    })
}


function gettingContacts() {
    document.getElementById('contacts').classList.remove("d-none", "d-md-block")
    document.getElementById("starting").setAttribute("style", "display:none")
    document.getElementById("chat-box").setAttribute("style", "display:none")
}
function goStarter() {
    document.getElementById('contacts').classList.add("d-none", "d-md-block")
    document.getElementById("starting").setAttribute("style", "display:block")
}

function MessageSent() {
    var messageOnChatting = {
        userId: currentUserKey,
        msg: document.getElementById("texting").value,
        dateTime: new Date().toLocaleString()
    }

    firebase.database().ref("messagesOnChattings").child(chatKey).push(messageOnChatting, function (error) {
        if (error) {
            alert(error)
        }
        else {
            //     var message = `<div class="row justify-content-end">
            //     <div class="col-6 col-sm-7 col-md-7">
            //         <p class="s-message float-right">
            //         ${document.getElementById("texting").value}
            //             <span class="s-time float-right">confirmation</span>
            //         </p>
            //     </div>
            // </div>
            // </div>`



            //             document.getElementById('card-body').innerHTML += message
            document.getElementById('texting').value = ""
            document.getElementById("texting").focus()
            // document.getElementById('card-body').scrollTop = document.getElementById('card-body').scrollHeight
        }
    })


}

function loadContacts() {
    var ref = firebase.database().ref("friend-list")
    ref.on('value', function (lists) {
        document.getElementById("contactsList").innerHTML = `<li class="list-group-item">
        <input type="text" placeholder="&#xF002; Search or start new chat" class="form-control r1"
            style="font-family:FontAwesome" />
    </li>`
        lists.forEach(function (data) {
            var list = data.val()

            var friendKey = ""
            if (list.friendId === currentUserKey) {
                friendKey = list.userId
            }
            else if (list.userId === currentUserKey) {
                friendKey = list.friendId
            }

            if(friendKey !== ""){

            
            firebase.database().ref("Users").child(friendKey).on('value', function (data) {

                var user = data.val()

                document.getElementById("contactsList").innerHTML += `<li class="list-group-item list-group-item-action" id="startingList" onclick="toHaveChatBox('${data.key}' , '${user.name}')">
                <div class="row" style="cursor: pointer;">
                    <div class="col-10">
                        <div class="Identity">${user.name}</div>
                        <div class="text">the text of a person</div>
                    </div>
                </div>
            </li>`
        
            })
            }
        })
    })

}

function showFriendList() {

    document.getElementById("friendList").innerHTML = `<div class="text-center text-primary p-5 mt-5" style="font-size:25px; font-weight:bold">
      <span role="status">Please Wait.... </span>
  </div>`

    var ref = firebase.database().ref("Users")
    var list = ""
    ref.on('value', function (users) {
        if (users.hasChildren()) {
            list = `<li class="list-group-item by">
                <input type="text" placeholder="&#xF002; Search or start new chat" class="form-control r1"
                    style="font-family:FontAwesome" />
            </li>`
        }
        users.forEach(function (data) {
            var user = data.val();
            if (user.email !== firebase.auth().currentUser.email) {
                list += `<li class="list-group-item list-group-item-action" data-dismiss="modal" onclick="toHaveChatBox('${data.key}' , '${user.name}' , '${user.photoURL}')">
                     <div class="row" style="cursor: pointer;">
                         <div class="col-10">
                             <div class="Identity">${user.name}</div>
                             <div class="text">the text of a person</div>
                         </div>
                     </div>
                 </li>`
            }
        })
        document.getElementById("friendList").innerHTML = list

    })

}
// FIREBASE

function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)

}
function signOut() {
    firebase.auth().signOut()
}
function stateChanged() {
    firebase.auth().onAuthStateChanged(gettingUserInfo)
}
function gettingUserInfo(user) {
    if (user) {
        alert("Logged In!" + " \n " + "User Email => " + firebase.auth().currentUser.email + '\n' + "User Name => " + firebase.auth().currentUser.displayName + '\n' + "Thanks for using our app! ")

        var UserInfo = { name: "", email: "" }
        UserInfo.name = firebase.auth().currentUser.displayName
        UserInfo.email = firebase.auth().currentUser.email

        var ref = firebase.database().ref("Users")
        var flag = false
        ref.on('value', function (users) {
            users.forEach(function (data) {
                var user = data.val()
                if (user.email === UserInfo.email) {
                    currentUserKey = data.key
                    flag = true
                }
            })
            if (flag === false) {
                firebase.database().ref("Users").push(UserInfo, callback)
            }
            else {
                document.getElementById('p1').style = "display:none"
                document.getElementById('p2').style = ""
            }
            document.getElementById('firstIn').classList.remove("disabled")
            document.getElementById('firstIn').style = "pointer-events:initial"

            loadContacts()
        })

    }
    else {
        document.getElementById('p1').style = ""
        document.getElementById('p2').style = "display:none"


        document.getElementById('firstIn').classList.add("disabled")
        document.getElementById('firstIn').style = "pointer-events:none"

    }
}

function callback(error) {
    if (error) {
        alert(error)
    }
    else {
        document.getElementById('p1').style = "display:none"
        document.getElementById('p2').style = ""
    }
}


stateChanged()