$(function () {
  var url_db = "http://127.0.0.1:5984/"; //url localhost
  var username = "admin"; //username connect database
  var password = "admin"; //password connect database
  var database = "multimedia"; //database name
  var arrayData = [];
  solrUrlPrefix = "/solr/collection1/";


  // init click event
  $('#login').click(handleLogin)

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
      console.log(result);
      location.reload();
    });
  }
  $(document).ready(function () {
    Call();
  });
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
  function addDoc() {
    var inputData = {
      id: document.getElementById("text-input-id").value,
      content: {
        TÊN: document.getElementById("text-input-name").value,
        "THỂ LOẠI": document.getElementById("text-input-bien-tap").value,
        "KỊCH BẢN": document.getElementById("text-input-ng-duyet-nd").value,
        "ĐẠO DIỄN": document.getElementById("text-input-cd-thuc-hien").value,
        "BIÊN TẬP": document.getElementById("text-input-nam-san-xuat").value,
      },
    };
    console.log("debug -", inputData);
    var settings = {
      url: url_db + database + "/" + inputData.id,
      username: username,
      password: password,
      method: "PUT",
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(username + ":" + password),
      },
      data: JSON.stringify(inputData.content),
    };
    $.ajax(settings).done(function (response) {
      console.log(response);
      location.reload();
    });
  }
  function openModalEdit(id) {
    $("#editModal").modal("show");
    return id;
  }
  function Call() {
    var account = [
      {
        user: "admin",
        password: "admin",
      },
    ];

    localStorage.setItem("account", JSON.stringify(account));
    $.ajax({
      url: url_db + database + "/_all_docs?include_docs=true",
      username: username,
      password: password,
      method: "GET",
      dataType: "jsonp",
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(username + ":" + password),
      },
      success: function (response) {
        console.log(Object.keys(response.rows[1].doc._attachments));
        arrayData = response;
        if (document.getElementById("tagsearch").value != "") {
          localStorage.setItem(
            "searchDoc",
            document.getElementById("tagsearch").value
          );
          console.log("eeee", document.getElementById("tagsearch").value);
          localStorage.setItem("arrDoc", JSON.stringify(response.rows));
          $("#table-cart-body").remove();
          $(".modal-body").append(`<div class="form-group row">
						<label for="example-email-input" class="col-2 col-form-label">Tên</label>
						<div class="col-6">
							<input class="form-control" type="email" id="text-input-edit-name">
						</div>
					</div>
					<div class="form-group row">
						<label for="example-url-input" class="col-2 col-form-label">THỂ LOẠI</label>
						<div class="col-6">
							<input class="form-control" type="url" id="text-input-edit-bien-tap">
						</div>
					</div>
					<div class="form-group row">
						<label for="example-url-input" class="col-2 col-form-label">KỊCH BẢN</label>
						<div class="col-6">
							<input class="form-control" type="url" id="text-input-edit-ng-duyet-nd">
						</div>
					</div>
					<div class="form-group row">
						<label for="example-url-input" class="col-2 col-form-label">ĐẠO DIỄN</label>
						<div class="col-6">
							<input class="form-control" type="url" id="text-input-edit-cd-thuc-hien">
						</div>
					</div>
					<div class="form-group row">
						<label for="example-url-input" class="col-2 col-form-label">BIÊN TẬP</label>
						<div class="col-6">
							<input class="form-control" type="url" id="text-input-edit-nam-san-xuat">
						</div>
					</div>`);
          $("#table-doc").append(`
							<tbody id="table-cart-body">
						`);
          const result = response.rows.filter(
            (word) => word.doc["TÊN"] == localStorage.getItem("searchDoc")
          );
          for (const media of result) {
            if (media) {
              $("#table-cart-body").append(`
								<tr id="table-cart-body-tr">
									<td><input  type="checkbox" onclick="SelectTable('${media.id}','${
                media.value.rev
              }')"/></td>
									<td scope="row"><input class="input-table ${
                    media.id
                  }" disabled type=text value="${
                media.doc["TÊN"] ? media.doc["TÊN"] : "Không có"
              }"/></td>
									<td scope="row"><input class="input-table ${
                    media.id
                  }" disabled type=text value="${
                media.doc["THỂ LOẠI"] ? media.doc["THỂ LOẠI"] : "Không có"
              }"/></td>
									<td scope="row"><input class="input-table ${
                    media.id
                  }" disabled type=text value="${
                media.doc["ĐẠO DIỄN"] ? media.doc["ĐẠO DIỄN"] : "Không có"
              }"/></td>
									<td scope="row"><input class="input-table ${
                    media.id
                  }" disabled type=text value="${
                media.doc["KỊCH BẢN"] ? media.doc["KỊCH BẢN"] : "Không có"
              }"/></td>
									<td scope="row"><input class="input-table ${
                    media.id
                  }" disabled type=text value="${
                media.doc["BIÊN TẬP"] ? media.doc["BIÊN TẬP"] : "Không có"
              }"/></td>
									<td id="${media.id}" scope="row">
										<td scope="col"><button class="btn btn-primary updateButton"  onclick="EditDoc('${
                      media.id
                    }','${media.value.rev}') ">Sửa</button></td>
									<td scope="col"><button class="btn btn-danger deleteButton"  onclick="DeleteDoc('${
                    media.id
                  }','${media.value.rev}')">Xoá</button></td>
								</tr>
									`);
              if (media.doc._attachments) {
                console.log("media", Object.keys(media.doc._attachments));
                for (
                  let i = 0;
                  i < Object.keys(media.doc._attachments).length;
                  i++
                ) {
                  $("#" + media.id)
                    .append(`<i style="margin-right:5px;" onclick="PlayVideo('${
                    Object.keys(media.doc._attachments)[i]
                  }','${media.id}')" class="fas fa-play"></i></td>
										`);
                }
              }
            }
          }
          $("#table-doc").append(`
							</tbody>
						`);
        } else {
          console.log("else");
          localStorage.setItem("arrDoc", JSON.stringify(response.rows));
          $("#table-cart-body").remove();
          $("#table-doc").append(`
							<tbody id="table-cart-body">
						`);
          for (const media of response.rows) {
            if (media) {
              $("#table-cart-body").append(`
								<tr id="table-cart-body-tr">
									<td><input  type="checkbox" onclick="SelectTable('${media.id}','${
                media.value.rev
              }')"/></td>
									<td scope="row"><input class="input-table ${
                    media.id
                  }" disabled type=text value="${
                media.doc["TÊN"] ? media.doc["TÊN"] : "Không có"
              }"/></td>
									<td scope="row"><input class="input-table ${
                    media.id
                  }" disabled type=text value="${
                media.doc["THỂ LOẠI"] ? media.doc["THỂ LOẠI"] : "Không có"
              }"/></td>
									<td scope="row"><input class="input-table ${
                    media.id
                  }" disabled type=text value="${
                media.doc["ĐẠO DIỄN"] ? media.doc["ĐẠO DIỄN"] : "Không có"
              }"/></td>
									<td scope="row"><input class="input-table ${
                    media.id
                  }" disabled type=text value="${
                media.doc["KỊCH BẢN"] ? media.doc["KỊCH BẢN"] : "Không có"
              }"/></td>
									<td scope="row"><input class="input-table ${
                    media.id
                  }" disabled type=text value="${
                media.doc["BIÊN TẬP"] ? media.doc["BIÊN TẬP"] : "Không có"
              }"/></td>
									<td id="${media.id}" scope="row">
										<td scope="col"><button class="btn btn-primary updateButton"  onclick="EditDoc('${
                      media.id
                    }','${media.value.rev}') ">Sửa</button></td>
									<td scope="col"><button class="btn btn-danger deleteButton"  onclick="DeleteDoc('${
                    media.id
                  }','${media.value.rev}')">Xoá</button></td>
								</tr>
									`);
              if (media.doc._attachments) {
                console.log("media", Object.keys(media.doc._attachments));
                for (
                  let i = 0;
                  i < Object.keys(media.doc._attachments).length;
                  i++
                ) {
                  $("#" + media.id)
                    .append(`<i style="margin-right:5px;" onclick="PlayVideo('${
                    Object.keys(media.doc._attachments)[i]
                  }','${media.id}')" class="fas fa-play"></i></td>
										`);
                }
              }
            }
          }
          $("#table-doc").append(`
							</tbody>
						`);
        }

        var elements = document.getElementsByClassName("updateButton");
        var elementsDelete = document.getElementsByClassName("deleteButton");
        let btnAdd = document.getElementById("btnAdd");
        const btnLogout = document.getElementById("btnLogout");
        const btnLogin = document.getElementById("btnLogin");
        if (JSON.parse(localStorage.getItem("isLogged")) == true) {
          btnAdd.classList.remove("hidden");
          btnLogout.style.display = "block";
          btnLogin.style.display = "none";
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("hidden");
            elementsDelete[i].classList.remove("hidden");
          }
        } else {
          btnAdd.classList.add("hidden");
          btnLogout.style.display = "none";
          btnLogin.style.display = "block";
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.add("hidden");
            elementsDelete[i].classList.add("hidden");
          }
        }
      },
    });
  }
  function handleLogin() {
    var user = document.getElementById("inputValueUsername").value + "";
    var password = document.getElementById("inputValuePass").value + "";
    var accountAdmin = JSON.parse(localStorage.getItem("account"));

    if (user == accountAdmin[0].user) {
      if (password == accountAdmin[0].password) {
        alert("Đăng nhập thành công");
        localStorage.setItem("isLogged", JSON.stringify(true));
        location.reload();
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
    location.reload();
  }
});


/**
 curl http://127.0.0.1:9200/multimedia/multimedia/_search?pretty=true

 curl -XPUT 'localhost:9200/_river/multimedia/_meta' -d '{
    "type" : "couchdb",
    "couchdb" : {
        "host" : "localhost",
        "port" : 5984,
        "db" : "multimedia",
        "filter" : null,
        "username": "admin",
        "password": "admin"
    },
    "index" : {
        "index" : "multimedia",
        "type" : "multimedia",
        "bulk_size" : "100",
        "bulk_timeout" : "10ms"
    }
}'

curl -X PUT 'http://127.0.0.1:9200/_river/testdb/_meta' -d '{ "type" : "couchdb", "couchdb" : { "host" : "localhost", "username":"admin","password":"admin", "port" : 5984, "db" : "testdb", "filter" : null }, "index" : { "index" : "testdb", "type" : "testdb", "bulk_size" : "100", "bulk_timeout" : "10ms" } }'
 */