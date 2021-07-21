$(function () {
  var url_db = "http://127.0.0.1:5984/"; //url localhost
  var username = "admin"; //username connect database
  var password = "admin"; //password connect database
  var database = "multimedia"; //database name
  solrUrlPrefix = "/solr/collection1/";


  /**
  =============================== CLICK EVENT   ======================
  **/
  $("#btn-add-doc").click(addDoc);
  $("#login").click(handleLogin);
  $("#btn-search").click(loadData)
  $("#typeSearch").change(function(){
      const searchType = $(this).children("option:selected").val();
      localStorage.setItem("searchType",searchType)
    });


  loadData()

  function reloadPage(){
    setTimeout(() => {
      $('#tagSearch').val('')
      $('#typeSearch').prop('selectedIndex',0);
      location.reload()

      $("#text-input-edit-name").val('');
      $("#text-input-edit-the-loai").val('');
      $("#text-input-edit-dao-dien").val('');
      $("#text-input-edit-kich-ban").val('');
      $("#text-input-edit-bien-tap").val('');
      $("#text-input-edit-video").val('');
    }, 1000)
  }

  this.PlayVideo = function(attachId, docId){
    window.open(`/view/${docId}/${attachId}`, '_blank');
  }

  this.DeleteDoc = function(id, rev) {
    const body = {
      "_rev": rev
    };
    fetch("/database/delete/"+id, {
      method: "DELETE", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        reloadPage()
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  this.EditDoc = function (id,rev) {
    $("#editModal").modal('show');

    // initial value for form
    const inputs = document.getElementsByClassName('input-table ' + id);
    const inputData = [];
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].disabled = false;
      inputs[i].style.border = " 1px";
      inputData.push(inputs[i].value);
    }
    $("#text-input-edit-name").val(inputData[0]);
    $("#text-input-edit-the-loai").val(inputData[1]);
    $("#text-input-edit-dao-dien").val(inputData[2]);
    $("#text-input-edit-kich-ban").val(inputData[3]);
    $("#text-input-edit-bien-tap").val(inputData[4]);
    $("#text-input-edit-videeo").val(inputData[5]);

    // set onclick addEventListener
    $('#edit-modal').click(function(){
      const body = {
        "_rev": rev,
        "TÊN": $("#text-input-edit-name").val(),
        "THỂ LOẠI": $("#text-input-edit-the-loai").val(),
        "KỊCH BẢN": $("#text-input-edit-kich-ban").val(),
        "ĐẠO DIỄN": $("#text-input-edit-dao-dien").val(),
        "BIÊN TẬP": $("#text-input-edit-bien-tap").val(),
        "FILE": $("#text-input-edit-video"),
      };
      fetch("/database/edit/"+id, {
        method: "PUT", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
          reloadPage()
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    })
  }

  function loadData() {
    const searchType = localStorage.getItem('searchType') || 'name'
    const searchTag = $('#tagsearch').val()
    console.log({
      searchType,
      searchTag
    })
    let url = '/search';
    if(searchTag){
      const params = new URLSearchParams({
        [searchType]: searchTag
      });
      url = `/search?${params.toString()}`
    }

    const myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');
    fetch(url, {
      method: "GET",
      headers: myHeaders
    })
      .then((response) => response.json())
      .then((response) => {
        $("#table-cart-body").remove();
        $("#table-doc").append(`<tbody id="table-cart-body">`);

        for (const media of response.docs) {
          if (media) {
            $("#table-cart-body").append(`
                <tr id="table-cart-body-tr">
                  <td>
                    <input  type="checkbox" onclick="SelectTable('${media.id}','${media.doc._rev}')"/>
                  </td>

                  <td scope="row">
                    <input class="input-table ${media.id}" disabled type=text value="${media.doc["TÊN"] ? media.doc["TÊN"] : "Không có"}"/>
                  </td>

                  <td scope="row">
                    <input class="input-table ${media.id}" disabled type=text value="${media.doc["THỂ LOẠI"] ? media.doc["THỂ LOẠI"] : "Không có"}"/>
                  </td>

                  <td scope="row">
                    <input class="input-table ${media.id}" disabled type=text value="${media.doc["ĐẠO DIỄN"] ? media.doc["ĐẠO DIỄN"] : "Không có"}"/>
                  </td>

                  <td scope="row">
                    <input class="input-table ${media.id}" disabled type=text value="${media.doc["KỊCH BẢN"] ? media.doc["KỊCH BẢN"] : "Không có"}"/>
                  </td>

                  <td scope="row">
                    <input class="input-table ${media.id}" disabled type=text value="${media.doc["BIÊN TẬP"] ? media.doc["BIÊN TẬP"] : "Không có"}"/>
                  </td>

                  <td id="${media.id}" scope="row">
                    <td scope="col">
                      <button class="btn btn-primary updateButton"  onclick="EditDoc('${media.id}','${media.doc._rev}') ">Sửa</button>
                    </td>

                  <td scope="col">
                    <button class="btn btn-danger deleteButton" onclick="DeleteDoc('${media.id}','${media.doc._rev}')">Xoá</button>
                  </td>

                </tr>`);

            if (media.doc._attachments) {
              for (let i = 0; i < Object.keys(media.doc._attachments).length; i++) {
                $("#" + media.id).append(`
                  <button type="button" class="btn btn-secondary" onclick="PlayVideo('${Object.keys(media.doc._attachments)[i]}','${media.id}');">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-paperclip" viewBox="0 0 16 16">
                    <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z"></path>
                  </svg>
                  </button>
                  </td>
              `);
              }
            }
          }
        }

        $("#table-doc").append(`</tbody>`);

        const elements = $(".updateButton").children();
        const elementsDelete = $(".deleteButton").children();
        let btnAdd = $("#btnAdd");
        const btnLogout = $("#btnLogout");
        const btnLogin = $("#btnLogin");

        if (JSON.parse(localStorage.getItem("isLogged")) == true) {
          btnAdd.removeClass("hidden");
          btnLogout.css('display', "block");
          btnLogin.css('display', "none");
          for (let i = 0; i < elements.length; i++) {
            elements[i].removeClass("hidden");
            elementsDelete[i].removeClass("hidden");
          }
        } else {
          btnAdd.addClass("hidden");
          btnLogout.css('display', "none");
          btnLogin.css('display', "block");
          for (let i = 0; i < elements.length; i++) {
            elements[i].addClass("hidden");
            elementsDelete[i].addClass("hidden");
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function addDoc() {
    const body = {
      "TÊN": $("#text-input-name").val(),
      "THỂ LOẠI": $("#text-input-the-loai").val(),
      "KỊCH BẢN": $("#text-input-kich-ban").val(),
      "ĐẠO DIỄN": $("#text-input-dao-dien").val(),
      "BIÊN TẬP": $("#text-input-bien-tap").val(),
    };

    const formData = new FormData();
    for(const name in body) {
      formData.append(name, body[name]);
    }
    try {
      formData.append('FILE',$('#text-input-file')[0].files[0])
    } catch(e){
      console.log('API /add', e)
    }


    fetch(
      "/database/add",
      {
        method: "POST",
        body: formData,
      }
    )
      .then(response => response.json())
      .then(data => reloadPage())
      .catch(error => console.error("Error:", error));
  }

  function videoResults(name, path) {
    this.videoName = name;
    this.videoPath = path;
    this.videoId =
      path.split("/").pop() +
      "_" +
      name.substring(0, name.lastIndexOf(".")).replace(".", "_");
    this.videoTime = new Array();
    this.frameList = new Array();
    this.frameRank = new Array();
  }

  function setCurTime(vid, seconds) {
    vid.currentTime = seconds;
  }

  function reWriteImageUrl(imgUrlOriginal) {
    imgUrl = "http://localhost:8983/solr/" + imgUrlOriginal;
    return imgUrl;
  }

  function getCBIRLinks(myID) {
    result = "";
    result += '<div style="font-size:8pt">';
    result += "<p>Cập nhật: ";
    result +=
      "<a href=\"javascript:hashSearch('ce','" + imageUrl + "');\">Thêm</a>, ";
    result +=
      "<a href=\"javascript:hashSearch('fc','" +
      imageUrl +
      "');\">Chỉnh sửa</a>, ";
    result +=
      "<a href=\"javascript:hashSearch('jc','" + imageUrl + "');\">Xoá</a>, ";
    result += "</p></div>";
    return result;
  }

  function printVideoResults(docs) {
    var lastVideo = $("#videoResults");
    var videoResultsArray = new Array();

    for (var i = 0; i < docs.length; i++) {
      myID = docs[i].id.toString();
      myID = myID.split(":\\").pop();
      myID = myID.replace(/\\/g, "/");
      filename = myID.replace(/^.*(\\|\/|\:)/, "");
      frameNumber = filename.replace(".jpg", "");
      videoFolderName = myID;
      videoFolderName = videoFolderName.substring(
        0,
        videoFolderName.lastIndexOf("/")
      );
      videoName = videoFolderName.replace(/^.*(\\|\/|\:)/, "");
      videoName = videoName.replace("_keyframes", ".mp4");
      videoFolderName = videoFolderName.substring(
        0,
        videoFolderName.lastIndexOf("/")
      );

      time = parseInt(frameNumber);
      if (videoResultsArray[videoName] == null) {
        videoResultsArray[videoName] = new videoResults(
          videoName,
          videoFolderName
        );
      }

      videoResultsArray[videoName].videoTime.push(time);

      videoResultsArray[videoName].frameList.push(reWriteImageUrl(myID));
      videoResultsArray[videoName].frameRank.push(i + 1);
    }
    //Print result
    var i = 0;

    for (var x in videoResultsArray) {
      i++;

      if (i <= $("#slider-maxVideos").val()) {
        lastVideo.append('<div class="row">');
        var value = videoResultsArray[x];

        lastVideo.append(
          '<div id="infoRow' +
            i +
            '" class="col-xs-12 col-sm-4 col-md-4 col-lg-3">'
        );
        var thisID = $("#infoRow" + i);
        recentVideo = $(
          "<br><h3>Kết quả Video " +
            i +
            ": </h3> <h5>" +
            "<font color=grey> Tên video: </font>" +
            value.videoName +
            "<br></h5>" +
            "</div>"
        );
        thisID.append(recentVideo);

        lastVideo.append(
          '<div id="videoRow' +
            i +
            '" class="col-xs-12 col-sm-8 col-md-8 col-lg-6">'
        );
        thisID = $("#videoRow" + i);
        recentVideo = $(
          '<div align="left"><video id=' +
            value.videoId +
            ' width="480px" height="270px" controls><source src="' +
            value.videoPath +
            "/" +
            value.videoName +
            "\" type='video/mp4' /></video>" +
            //+ "<br><button onClick=\" capture(" + value.videoId +") \" style=\"width: 128px;border: solid 2px #ccc;\">Capture Frame</button>"
            "</div>" +
            "<br>" +
            "</div>"
        );
        thisID.append(recentVideo);

        var col = "col-xs-3 col-sm-1 col-md-1 col-lg-3";
        lastVideo.append(
          '<div id="resultsRow' +
            i +
            '" class="col-xs-12 col-sm-12 col-md-12 col-lg-3">'
        );
        thisID = $("#resultsRow" + i);

        thisID.append("<p> Kết quả phù hợp: ");

        var h, m, s, seconds;
        for (y = 0; y < value.videoTime.length; y++) {
          console.log(value);
          seconds = value.videoTime[y] - 3;
          h = seconds / 3600.0; //3600000.0
          m = (h - Math.floor(h)) * 60.0;
          s = (m - Math.floor(m)) * 60;
          var timeString =
            (Math.floor(h) > 0 ? parseInt(Math.floor(h)) + ":" : "") +
            (m >= 10
              ? parseInt(Math.floor(m))
              : "0" + parseInt(Math.floor(m))) +
            ":" +
            (s >= 10 ? parseInt(Math.floor(s)) : "0" + parseInt(Math.floor(s)));
          //<a href=\"" + myID + "\" target=\"_blank\" class=\"thumbnail\">"
          recent = $(
            '<div class="' +
              col +
              '">' +
              '<img class="thumbnail" src="' +
              value.frameList[y] +
              ' "style="width:60px;height:60px" onclick="setCurTime(' +
              value.videoId +
              ", " +
              seconds +
              ')">' +
              "<h6>Rank:" +
              value.frameRank[y] +
              "<br>Time:" +
              timeString +
              "</h6>" +
              "</div>"
          );
          thisID.append(recent);
        }

        lastVideo.append("</p></div>");
      }
    }
  }

  function printResults(docs) {
    var last = $("#imageResults");
    wrapper = $('<div class="row"></div>');
    wrapper.insertAfter(last);
    last = wrapper;
    for (var i = 0; i < docs.length; i++) {
      myID = docs[i].id.toString();
      myID = myID.split(":\\").pop();
      myID = myID.replace(/\\/g, "/");

      imageUrl = reWriteImageUrl(myID);
      var col = "col-lg-2 col-md-3 col-sm-3 col-xs-4";
      recent = $(
        '<div class="' +
          col +
          '"> <a href="' +
          myID +
          '" target="_blank" class="thumbnail">' +
          '<img src="' +
          myID +
          '"style="width:100px;height:100px"></a>' +
          getCBIRLinks(myID) +
          "</div>"
      );
      last.append(recent);
    }
  }

  function clearData() {
    $(".row").remove();
    $("#videoResults").empty();
    $("#perf").html(
      'Xin vui lòng chờ kết quả .... <img src="img/loader-light.gif"/>'
    );
  }
  function SelectTable(id, rev) {
    var objectValue = {
      id: id,
      rev: rev,
    };
    localStorage.setItem("test", JSON.stringify(objectValue));
  }
  function DeleteDoc(id, rev) {
    var obj = localStorage.getItem("test");
    // var objjj = JSON.parse(obj);
    // console.log('retrievedObject: ', JSON.parse(obj));
    console.log("id ", id);
    console.log("rev", rev);
    $.ajax({
      type: "DELETE",
      url: url_db + database + "/" + id + "?rev=" + rev,
      username: username,
      password: password,
      headers: {
        Authorization: "Basic " + btoa(username + ":" + password), //Tài khoản user, admin
      },
    }).done(function (result) {
      reloadPage()
    });
  }
  function PlayVideo(attach, id) {
    console.log(attach, id);
    // for (let i = 0; i < arrayData.rows.length; i++) {
    // 	if (arrayData.rows[i].id == mediaId) {
    // 		console.log(Object.keys(arrayData.rows[i].doc._attachments));
    // 		if(arrayData.rows[i].doc._attachments){
    // 			window.open("http://127.0.0.1:5984/multimedia/" + arrayData.rows[i].id + "/" + Object.keys(arrayData.rows[i].doc._attachments));
    // 		}else{
    // 			alert("Không có attachments");
    // 		}
    // 	}

    // }
    window.open("http://127.0.0.1:5984/multimedia/" + id + "/" + attach);
  }

  function openModalEdit(id) {
    $("#editModal").modal("show");
    return id;
  }

  function handleLogin() {
    var user = document.getElementById("inputValueUsername").value + "";
    var password = document.getElementById("inputValuePass").value + "";
    var accountAdmin = JSON.parse(localStorage.getItem("account"));

    if (user == 'admin') {
      if (password == 'admin') {
        alert("Đăng nhập thành công");
        localStorage.setItem("isLogged", JSON.stringify(true));
        reloadPage()
        return true;
      } else {
        alert("Sai mật khẩu");
        return false;
      }
    } else {
      alert("Sai tài khoản");
      return false;
    }
    console.log("Debugs login", JSON.parse(localStorage.getItem("isLogged")));
  }
  function handleLogout() {
    localStorage.removeItem("isLogged");
    reloadPage()
  }
});
