//APIキーの設定とSDKの初期化
var appKey    = "50a945c15520b92f21cf848ec99938676e5987bef7d8ab7f18b5cf9f78542210";
var clientKey = "5995c27f953fa4fe7ee74fa1f35a343c2c6fdab7c74acb2a1da83cdcc71047a8";
var ncmb    　= new NCMB(appKey,clientKey);

// -------[Demo1]データをmBaaSに保存する -------//
function sendForm() {
        
    //ユーザーの入力したデータを変数にセットする
    var taskname    = $("#form_name").val();            //タスク名
    var date        = $("#form_date").val();            //期限日
    var time        = $("#form_time").val();            //期限時間
    var priority    = $("#form_priority").val();        //重要度
    var condition   = $("#form_condition").val();       //調子
    var days        = $("#form_days").val();            //記録数
    var level       = $("#form_level").val();           //進化段階
              
    //数値に変換
    priority = Number(priority);
    days = Number(days);
    level = Number(level);

    //期限までの日数を算出する
    var today = new Date();
    var setdate = new Date(date);
	  var diff = setdate.getTime() - today.getTime();
	  var kikan = Math.floor(diff / (1000 * 60 * 60 *24));
    kikan++;

    if(kikan<=10){
      var sinsa = 1;
    } 
    else if(kikan<=21){
      var sinsa = 2;
    }
    else{
      var sinsa = 3;
    }
    
    //期限日と時間を合わせる
    //var dateandtime = date+" "+time;   
    var limit = date+" "+time;    
    //Date型に変換
    //var limit = new Date(dateandtime);

    //入力規則およびデータをフィールドにセットする
    if(taskname == ""){
        alert("タスク名が入力されていません");
    }else if( date == "" || time == "" ){
        alert("期限日が入力されていません");
    }else if(priority == ""){
        alert("重要度が入力されていません");
    }else{
        //mBaaSに保存先クラスの作成
        var SaveData = ncmb.DataStore("SaveData");
            
        //インスタンスの生成
        var saveData = new SaveData();
            
        //インスタンスにデータをセットする
        saveData.set("taskname", taskname)
                .set("limit", limit)
                .set("priority", priority)
                .set("condition", condition)
                .set("days", days)
                .set("level", level)
                .set("kikan", kikan)
                .set("sinsa", sinsa)
                .save()
                .then(function(results){
                    //保存に成功した場合の処理
                    alert("モンスターが誕生しました");
                    console.log("モンスターが誕生しました");
                    location.reload();
                })
                .catch(function(error){
                    //保存に失敗した場合の処理
                    alert("タスク送信ができませんでした：\n" + error);
                    console.log("タスク送信ができませんでした：\n" + error);
                });
    }
}

//------- [Demo2]保存したデータを全件検索し取得する-------//
function checkForm(){
    $("#formTable").empty();
        
    //インスタンスの生成
    var saveData = ncmb.DataStore("SaveData");
        
    //データを降順で取得する
    saveData.order("limit")
            .fetchAll()
            .then(function(results){
                //全件検索に成功した場合の処理
                console.log("全件検索に成功しました："+results.length+"件");
                //テーブルにデータをセット
                setData(results);
            })
            .catch(function(error){
                //全件検索に失敗した場合の処理
                alert("全件検索に失敗しました：\n" + error);
                console.log("全件検索に失敗しました：\n" + error);
            });
}

//------- 日々記録のためのデータを取得する -------//
function checkDate(){
    $("#judgeTable").empty();

    //インスタンスの生成
    var saveData = ncmb.DataStore("SaveData");

    //タスクのデータを取得する
    saveData.fetchAll()
            .then(function(results){
                //全件検索に成功した場合の処理
                console.log("全件検索に成功しました："+results.length+"件");
                //テーブルにデータをセット
                judData(results);
            })
            .catch(function(error){
                //全件検索に失敗した場合の処理
                alert("全件検索に失敗しました：\n" + error);
                console.log("全件検索に失敗しました：\n" + error);
            });
    
}

//テーブルにデータをセットする処理
function setData(results) {
    //操作するテーブルへの参照を取得
    var table = document.getElementById("formTable");
        for(i=0; i<results.length; i++) {
            var object = results[i];
            var year     = object.get("limit").slice(0,4);      //YYYYを取り出す
            var month    = object.get("limit").slice(5,7);      //MMを取り出す
            var day      = object.get("limit").slice(8,10);     //DDを取り出す            
            var hour     = object.get("limit").slice(11,13);    //hhを取り出す
            var minute   = object.get("limit").slice(14,16);    //mmを取り出す
                
            //hourが協定時間なので、現地時間（+09:00）となるようにする
            var datehour = new Date(hour);  //hourをDate型に変換
            var jsthour  = datehour.getHours();  //datehourを現地時間にする
            var jstDate  = year + "/" + month + "/" + day + " " + hour +":"+ minute;
                
            //テーブルに行とセルを設定
            var row      = table.insertRow(-1);
            var cell     = row.insertCell(-1);
                
            formTable.rows[i].cells[0].innerHTML = jstDate + "<br>" + "タスク名：　" + object.get("taskname") +"<br>" +"重要度："+object.get("priority");
        }
    var searchResult = document.getElementById("searchResult");
    searchResult.innerHTML = "タスク数："+results.length+"件";
        
    //セットするデータが無かった場合
    if(results.length == 0){
        var table = document.getElementById("formTable");
        formTable.innerHTML = "<br>" + "<center>" + "データはありません" + "</center>" + "<br>";   
    }
    $.mobile.changePage('#ListUpPage');
}

//テーブルに審査または日々記録を表示させる
function judData(results){
  //操作するテーブルへの参照を取得
  var table = document.getElementById("judgeTable");
  var head;
    
    //審査日か日々記録かを判別する
    for(i=0; i<results.length; i++) {
      var object = results[i];
      var kikan = object.get("kikan");
      var num = object.get("sinsa");
      var limit = object.get("limit");
      var createDate = object.get("createDate");

      //今日が期限日までどのくらいの位置にいるか
      kikan = Number(kikan);
      limit = new Date(limit);
      var today = new Date();
      var Diff = limit.getTime() - today.getTime();
	    var judday = Math.floor(Diff / (1000 * 60 * 60 *24));
      judday++;

      var perday = judday/kikan*100;

      //審査回数別に分ける
      if(kikan<=10){
        if(perday >= 50 && num == 1){
          sinsa();
          
        } else{
          kiroku();
        }
      }
      else if(kikan<=21){
        if((perday >= 30 && num == 2) || (perday >=70 && num == 1)){
          sinsa();
        } else{
          kiroku();
        }
      }
      else{
        if((perday >= 30 && num == 3) || (perday >=60 && num == 2) || (perday >=90 && num == 1)){
          sinsa();
        } else{
          kiroku();
        }
      }

      //テーブルに行とセルを設定
      var row      = table.insertRow(-1);
      var cell     = row.insertCell(-1);
                
      table.rows[i].cells[0].innerHTML = "<h4>" + head + "</h4>";
    }

  function kiroku(){
   head = "今日の進捗を教えてあげよう";
  };
  
  function sinsa(){
   head = "今日はモンスターの診断日だよ";
      
   //インスタンス
   var saveData = ncmb.DataStore("SaveData");

  //インスタンスにデータをセットする
   saveData.set("sinsa", num);
            return saveData.update() // 保存したgameScoreオブジェクトを更新
            // 更新後の処理
            .then(function(result){
            alert("データが更新されました");
            console.log("データが更新されました");
            })
           .catch(function(error){
           //保存に失敗した場合の処理
           alert("データの更新ができませんでした：\n" + error);
           console.log("データの更新ができませんでした：\n" + error);
           });        

  }
}