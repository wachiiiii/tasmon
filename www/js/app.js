////////////////////////////////////////
/*プレビュー画面で正しく表示させるため*/
////////////////////////////////////////

// function onDeviceReady() {
//     alert("読み込まれました");
// }
// var event = typeof cordova === 'undefined' ? 
//                               'DOMContentLoaded' : 'deviceready';
// document.addEventListener(event, onDeviceReady, false);

//APIキーの設定とSDKの初期化
var appKey    = "50a945c15520b92f21cf848ec99938676e5987bef7d8ab7f18b5cf9f78542210";
var clientKey = "5995c27f953fa4fe7ee74fa1f35a343c2c6fdab7c74acb2a1da83cdcc71047a8";
var ncmb     = new NCMB(appKey,clientKey);

/* =============================================================================
            <タスク入力>データをmBaaSに保存する
==============================================================================*/
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
    //var limit = new Date(limit);

    //入力規則およびデータをフィールドにセットする
    if(taskname == ""){
        alert("タスク名が入力されていません");
    }else if( date == "" ){
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
                    console.log("タスク送信ができました");
                    Birth(priority);
                })
                .catch(function(error){
                    //保存に失敗した場合の処理
                    alert("タスク送信ができませんでした：\n" + error);
                    console.log("タスク送信ができませんでした：\n" + error);
                });
    };
}

//------ タマゴ誕生 -----//
function Birth(priority){
 var pri = priority;
 $("#formTable").empty();
 $("#formTable").append("<p>準備中・・・</p><p>何かのタマゴが産み落とされたようです</p><a href='' onclick='newmon("+pri+");'><img src='../img/tamago.png' width='200px' height='auto' alt='たまご'></a>")
}

//------ タスモン誕生 ------//
function newmon(pri){
  alert("タスモンが誕生しました");

 var monname;

 if( pri == 1 ){    
    monname = "ボルボックス";
  }
  else if( pri == 2 ){     
    monname = "マルマックス";
  }
  else if( pri == 3 ){     
    monname = "サクサックス";
  }

  //インスタンスの生成
 var saveData = ncmb.DataStore("SaveData");

 //タスクのデータを取得する
 saveData.order("createDate",true)
         .fetchAll()
         .then(function(results){
         //テーブルにデータをセット

          var object = results[0];
          var name = object.get("taskname");
          var year     = object.get("limit").slice(0,4);      //YYYYを取り出す
          var month    = object.get("limit").slice(5,7);      //MMを取り出す
          var day      = object.get("limit").slice(8,10);     //DDを取り出す  
          var lim = year + "." + month + "." + day ;

          $("#formTable").empty();
          $("#formTable").append("<p>新しいタスモンが誕生しました！</p><p>"+monname+"</p><img src='../img/nor_mon/tasmon"+pri+"-1.svg' alt='"+monname+"'><p>タスク名: "+name+"</p><p>期限: "+lim+"</p><input type='button' value='OK' onclick='window.location.reload();'>");
         })
}


/* =============================================================================
            <タスク一覧>データを一覧で表示する
==============================================================================*/
function checkForm(){
    $("#formTable").empty();
        
    //インスタンスの生成
    var saveData = ncmb.DataStore("SaveData");
        
    //データを降順で取得する
    saveData.order("createDate",true)
            .limit(5)
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

//テーブルにデータをセットする処理
function setData(results) {
    //操作するテーブルへの参照を取得
        for(var i=0; i<results.length; i++) {
            var object = results[i];

            var year     = object.get("limit").slice(0,4);      //YYYYを取り出す
            var month    = object.get("limit").slice(5,7);      //MMを取り出す
            var day      = object.get("limit").slice(8,10);     //DDを取り出す            
            var hour     = object.get("limit").slice(11,13);    //hhを取り出す
            var minute   = object.get("limit").slice(14,16);    //mmを取り出す
                
            //hourが協定時間なので、現地時間（+09:00）となるようにする
            var datehour = new Date(hour);  //hourをDate型に変換
            var jsthour  = datehour.getHours();  //datehourを現地時間にする
            var jstDate  = year + "." + month + "." + day ;

            //期限までの日数を算出する
            var date = object.get("limit");
            var today = new Date();
            var setdate = new Date(date);
	          var diff = setdate.getTime() - today.getTime();
	          var last = Math.floor(diff / (1000 * 60 * 60 *24));
            last++;

            var txt = "<div><p>残り" + last + "日" + "</p><p>" + object.get("taskname") +"</p><p>" + "期限:" + jstDate + "</p><p>" +object.get("priority")+"</p></div>";

            $("#formTable").append(txt);
        }
        
    //セットするデータが無かった場合
    if(results.length == 0){
        var table = document.getElementById("formTable");
        formTable.innerHTML = "<br>" + "<center>" + "データはありません" + "</center>" + "<br>";   
    }
    $.mobile.changePage('#ListUpPage');
};


/* =============================================================================
            <日々記録>データを検索し、分岐表示
==============================================================================*/

function checkDate(){
    $("#judgeTable").empty();

    //インスタンスの生成
    var saveData = ncmb.DataStore("SaveData");

    //タスクのデータを取得する
    saveData.order("createDate",true)
            .limit(5)
            .fetchAll()
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
    
};

//テーブルに審査または日々記録を表示させる
  var url;
  
function judData(results){
  var head;
    
    //審査日か日々記録かを判別する
    for( i=0; i<results.length; i++) {
      var object = results[i];
      var name = object.get("taskname");
      var kikan = object.get("kikan");
      var num = object.get("sinsa");
      var limit = object.get("limit");
      var createDate = object.get("createDate");
      var pri = object.get("priority");
      var lev = object.get("level");

      //今日が期限日までどのくらいの位置にいるか
      kikan = Number(kikan);
      var setdate = new Date(createDate);
      var today = new Date();
      var Diff = today.getTime() - setdate.getTime();
	    var judday = Math.floor(Diff / (1000 * 60 * 60 *24));
      judday++;   //記入日から何日経過したのか
      
      var perday = judday/kikan*100;  
       perday = Math.round(perday);  //今日までに何%進捗があればいいか

      //審査回数別に分ける
      if(perday>=100){
            final();
      }
      else if(kikan<=10){
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
        
      $("#judgeTable").append("<h4>" + name + "</h4><div><img src ='../img/nor_mon/tasmon"+ pri + "-" + lev +".svg'></div><p>"+head+"</p><a href='input.html' onclick = 'Input("+i+");' >記録する</a>");
    }

  function kiroku(){
   head = "今日のタスクの達成度はどれくらい？";
  };
  
  function sinsa(){
   head = "運命の審査日";
  };

 function final(i){
   head = "タスクの締切日です";
  }; 
}

/* =============================================================================
            <日々記録>記録ページ
==============================================================================*/

function Input(i){
//  console.log(i);

 $("#oneTable").empty();

 //インスタンスの生成
 var saveData = ncmb.DataStore("SaveData");

 //タスクのデータを取得する
 saveData.order("createDate",true)
         .fetchAll()
         .then(function(results){
         //テーブルにデータをセット
          var head;
          var choice;
    
          var object = results[i];
          var name = object.get("taskname");
          var kikan = object.get("kikan");
          var num = object.get("sinsa");
          var limit = object.get("limit");
          var createDate = object.get("createDate");
          var pri = object.get("priority");
          var lev = object.get("level");

        //今日が期限日までどのくらいの位置にいるか
          kikan = Number(kikan);
          var setdate = new Date(createDate);
          var today = new Date();
          var Diff = today.getTime() - setdate.getTime();
          var judday = Math.floor(Diff / (1000 * 60 * 60 *24));
          judday++;   //記入日から何日経過したのか
      
          var perday = judday/kikan*100;  
          perday = Math.round(perday);  //今日までに何%進捗があればいいか

        //審査回数別に分ける
          if(perday>=100){
            final(i);
          }
          else if(kikan<=10){
            if(perday >= 50 && num == 1){
            sinsa(perday, i);
            } else{
            kiroku(i);
            }
          }
          else if(kikan<=21){
            if((perday >= 30 && num == 2) || (perday >=70 && num == 1)){
            sinsa(perday, i);
            } else{
            kiroku(i);
            }
          }
          else{
            if((perday >= 30 && num == 3) || (perday >=60 && num == 2) || (perday >=90 && num == 1)){
            sinsa(perday, i);
            } else{
            kiroku(i);
            }
          }
                                
        $("#oneTable").append("<div><img src ='../img/nor_mon/tasmon"+ pri + "-" + lev +".svg'>"+"<h4>" + name + "</h4>"+"<p>"+head+"</p>"+ choice+"</div>");
       
        function kiroku(i){
          head = "今日のタスクの達成度はどれくらい？";
          choice = "<p><input type='button' id='"+i+"' name='q1' value='1' onclick=inputT("+i+");><input type='button' id='"+i+"' name='q1' value='2' onclick=inputT("+i+");><input type='button' id='"+i+"' name='q1' value='3' onclick=inputT("+i+");><input type='button' id='"+i+"' name='q1' value='4' onclick=inputT("+i+");><input type='button' id='"+i+"' name='q1' value='5' onclick=inputT("+i+");></p><p><input type='button' id='comp' onclick='didTask("+i+");' value='終わった'></p>"
        };
  
        function sinsa(perday, i){
          head = "運命の審査日";
          choice = "<p>"+perday+"%</p>"+"<P><input type='button' id='q2' name='q2' onclick='Good("+i+");' value='達成'><input type='button' id='q3' name='q2' onclick='Bad("+i+");' value='未達成'></p><p><input type='button' id='comp' onclick='didTask("+i+");' value='終わった'></p>"
        };

        function final(i){
          head = "タスクの締切日です";
          choice ="<p><input type='button' id='comp' onclick='didTask("+i+");' value='終わった'><input type='button' id='comp' onclick='didnotTask("+i+");' value='終わらなかった'></p>"
        }; 

        })
        .catch(function(error){
        //全件検索に失敗した場合の処理
        alert("全件検索に失敗しました：\n" + error);
        console.log("全件検索に失敗しました：\n" + error);
        });
};

//----- 記録後の調子変化 -----//
function inputT(i){
 var saveData = ncmb.DataStore("SaveData"); 

 saveData.order("createDate",true)
         .fetchAll()
         .then(function(saveData){
          var object = saveData[i];
          var eday = object.get("days");
          //数値に変換
          eday = Number(eday);
          eday = eday + 1;
          object.setIncrement("days", 1);
          return object.update();
          })
          .then(function(){
           console.log("記録数を追加しました");
           $("#oneTable").empty();
           $("#oneTable").append("<div><p>今日の記録は完了しました<br>明日も待ってるね！</p>");
          })
 };
 //----- 審査結果(達成) -----//
function Good(i){
    var saveData = ncmb.DataStore("SaveData");
    var pri;
    var eday;
    var elevel;
    var esinsa;
    saveData.order("createDate",true)
         .fetchAll()
         .then(function(results){
          var object = results[i];
          pri = object.get("priority");
          eday = object.get("days");
          elevel = object.get("level");
          esinsa = object.get("sinsa");

          //数値に変換
          pri = Number(pri);
          eday = Number(eday);
          elevel = Number(elevel);
          esinsa = Number(esinsa);

          eday++;
          elevel++;
          esinsa--;

          object.setIncrement("days", 1);
          object.setIncrement("level", 1);
          object.setIncrement("sinsa", -1);
          return object.update();
          })
          .then(function(){
          console.log("記録数を追加しました");
          console.log("レベルがアップしました");
          console.log("審査日が一つ減りました");
          $("#oneTable").empty();
          $("#oneTable").append("<div><img src ='../img/nor_mon/tasmon"+ pri + "-" + elevel +".svg'></div>"+"<p>進行度はバッチリ！<br>タスモンは立派に成長しました！</p>");
          })
  };

 //----- 審査結果(未達成) -----//  
  function Bad(i){ 
    var saveData = ncmb.DataStore("SaveData");
    var pri;
    var eday;
    var elevel;
    var esinsa;
    saveData.order("createDate",true)
         .fetchAll()
         .then(function(results){
          var object = results[i];
          pri = object.get("priority");
          eday = object.get("days");
          elevel = object.get("level");
          esinsa = object.get("sinsa");

          //数値に変換
          pri = Number(pri);
          eday = Number(eday);
          elevel = Number(elevel);
          esinsa = Number(esinsa);

          eday++;
          esinsa--;
          object.setIncrement("days", 1);
          object.setIncrement("sinsa", -1);
          return object.update();
          })
          .then(function(){
          console.log("記録数を追加しました");
          console.log("審査日が一つ減りました");
          $("#oneTable").empty();
          $("#oneTable").append("<div><img src ='../img/nor_mon/tasmon"+ pri + "-" + elevel +".svg'></div>"+"<p>進行度はイマイチ・・・<br>まだまだタスモンは成長できないみたい。</p>");
          })
  };

 //----- タスクが終わった -----//
 function didTask(i){
   var saveData = ncmb.DataStore("SaveData");
    var cpri;
    var name;
    var cday;
    var cDate;
    var clevel;
    saveData.order("createDate",true)
         .fetchAll()
         .then(function(results){
          var object = results[i];
          cpri = object.get("priority");
          name = object.get("taskname");
          cday = object.get("days");
          cDate = object.get("createDate");
          clevel = object.get("level");

          //数値に変換
          cpri = Number(cpri);
          cday = Number(cday);
          clevel = Number(clevel);

          //タスク作成から今日までの日数をだす
          var today = new Date();
          var setdate = new Date(cDate);
	        var diff = today.getTime() - setdate.getTime();
	        var kikan = Math.floor(diff / (1000 * 60 * 60 *24));
          kikan++;
          kikan = Math.round(kikan/2);
          kikan = Number(kikan);

          if(kikan <= cday){
            clevel++;
          }

        //mBaaSに保存先クラスの作成
        var Completed = ncmb.DataStore("Completed");
        //インスタンスの生成
        var completed = new Completed();
            
        //インスタンスにデータをセットする
        completed.set("taskname", name)
                .set("priority", cpri)
                .set("level", clevel)
                .save()

        object.delete();

        })
        .then(function(){
          console.log("コレクションに追加しました");
          $("#oneTable").empty();
          $("#oneTable").append("<div><img src ='../img/com_mon/tasmon"+ cpri + "-" + clevel +".png'></div>"+"<p>タスク完了おめでとう！<br>あなたのタスモンは昇天しました！</p><a href='index.html' onclick='checkDate();'>OK</a>");
          })
 }

 //----- タスクが終わらなかった -----//
 function didnotTask(i){
    var saveData = ncmb.DataStore("SaveData");
    saveData.order("createDate",true)
         .fetchAll()
         .then(function(results){
          var object = results[i];
          object.delete();
          })
         .then(function(){
          console.log("タスクを削除しました");
          $("#oneTable").empty();
          $("#oneTable").append("<div><p>残念・・・<br>あなたのタスモンはいなくなってしまいました</p><a href='index.html' onclick='checkDate();'>OK</a>");
          })
 }

/* =============================================================================
            <コレクション>完了タスクデータの取得
==============================================================================*/
function completeTask(){
    $("#collTable").empty();
        
    //インスタンスの生成
    var completed = ncmb.DataStore("Completed");
        
    //データを降順で取得する
    completed.order("createDate",true)
            .fetchAll()
            .then(function(results){
                //全件検索に成功した場合の処理
                console.log("全件検索に成功しました："+results.length+"件");
                //テーブルにデータをセット
                setcoll(results);
            })
            .catch(function(error){
                //全件検索に失敗した場合の処理
                alert("全件検索に失敗しました：\n" + error);
                console.log("全件検索に失敗しました：\n" + error);
            });
}
//テーブルにデータをセットする処理
function setcoll(results) {
    //操作するテーブルへの参照を取得
        for(i=0; i<results.length; i++) {
            var object = results[i];

            var year     = object.get("createDate").slice(0,4);      //YYYYを取り出す
            var month    = object.get("createDate").slice(5,7);      //MMを取り出す
            var day      = object.get("createDate").slice(8,10);     //DDを取り出す           

            var jstDate  = year + "年" + month + "月" + day + "日" ;

            var pri = object.get("priority");
            var lev = object.get("level");
                
            var text = "<div><img src ='../img/com_mon/tasmon"+ pri + "-" + lev +".png'><p>" + object.get("taskname") +"</p><p>" + "タスク完了日:" + jstDate + "</p></div>";

            $("#collTable").append(text);
        }
        
    //セットするデータが無かった場合
    if(results.length == 0){
        $("#collTable").innerHTML = "<br>" + "<center>" + "データはありません" + "</center>" + "<br>";   
    }
    $.mobile.changePage('#ListUpPage');
}
