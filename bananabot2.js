const scriptName = "bananabot2";

// 카카오링크 설정
const keys = DataBase.getDataBase('key.txt').split('\n');
const kakaoKey = keys[0].trim();
const kakaoID = keys[1].trim();
const kakaoPWD = keys[2].trim();

const { KakaoLinkClient } = require('kakaolink');
const Kakao = new KakaoLinkClient(kakaoKey, "http://lt2.kr");
Kakao.login(kakaoID, kakaoPWD);

setTimeout(Api.reload, 86400000);

/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  
  if (msg.indexOf("?테스트") == 0) {
    DataBase.setDataBase('description.txt', "");
  }


  if ((msg == "?바나나") || (msg == "?명령어")) {
    let description = DataBase.getDataBase('description.txt');
    replier.reply("※ 명령어 목록 " + "\u200b".repeat(501) + "\n\n" + description);
  }


  // 롤 챔피언 전적 검색
  if (msg.indexOf("?롤충 ") == 0) {
    let toSearch = msg.replace(/\?롤충 /, "").replace(/ /g, "%20");
    let toSearchUrl = "http://fow.kr/find/" + toSearch;
    let fowHtml = org.jsoup.Jsoup.connect(toSearchUrl).get().html();

    let summonerNameData = fowHtml.match(/28px; font-weight:bold;">.+</);
    let summonerName = String(summonerNameData).replace(/28px; font-weight:bold;">/, "").replace(/</, "");

    let levelData = fowHtml.match(/레벨: \d+</);
    let level = String(levelData).replace(/레벨: /, "").replace(/</, "");

    let soloRankInfo = null;
    let mostPickInfo = null;

    try {
      let soloRankData = fowHtml.split("솔로랭크 5x5")[1].split("자유랭크 5x5")[0].replace(/<[^>]+>/g, "");
      let soloRankTier = soloRankData.split("등급:")[1].split("리그")[0].trim();
      let soloRankPoint = soloRankData.split("포인트:")[1].split("승급전")[0].trim();
      soloRankInfo = soloRankTier + " " + soloRankPoint + "점\n";
    } catch (error) {
      soloRankInfo = "정보없음\n";
    }

    try {
      let mostPickHtml = fowHtml.split("펜타+")[1].split("챔피언")[0];
      let mostPickData = mostPickHtml.match(/18"> .+ </);
      let mostPick = String(mostPickData).replace(/18"> /, "").replace(/ </, "");
      let mostPickNumData = mostPickHtml.match(/<td>\d+<\/td>/);
      let mostPickNum = String(mostPickNumData).replace(/<td>/, "").replace(/<\/td>/, "");
      mostPickInfo = "\n☝🏻 이 분은 " + Josa(mostPick, "을") + " " + mostPickNum + "번 플레이한 " + mostPick.replace(/ /g, "") + "충입니다.";
    } catch (error) {
      mostPickInfo = "☝🏻 이 분은 아직 랭크 게임을 플레이 하시지 않았네요!";
    }

    replier.reply("소환사명: " + summonerName + "\n레벨: " + level + "\n솔랭: " + soloRankInfo + mostPickInfo);
  }


  // 한강 수온
  if (msg == "?한강") {
    var hangangAPI = Utils.getWebText("https://api.hangang.msub.kr/");
    var waterTemp = hangangAPI.split("\"temp\":\"")[1].split("\",\"time")[0].replace(/<[^>]+>/g, "").trim();

    replier.reply("🌡 지금 한강은 " + waterTemp + "도 입니다.");
  }


  // 모든갤 랜덤개념글
  if ((msg.indexOf("?") == 0) && msg.indexOf("갤") == msg.length - 1) {
    try {
      // 명령어를 구글에 검색
      let toSearch = msg.replace(/\?/, "").replace(/ /g, "%20");
      let searchLink = "https://www.google.com/search?q=" + toSearch;

      let isMgallery = false;
      let isMiniGallery = false;

      // 검색 결과 중 디씨 홈페이지를 탐색
      let googleHtml = org.jsoup.Jsoup.connect(searchLink).get().html();
      let dcLink = googleHtml.match(/dcinside\.com.+?"/); // 보통 갤러리
      if (String(dcLink).indexOf("mini") != -1) {
        isMiniGallery = true;
      }

      let dcId = String(dcLink).replace(/.+id=/, "").replace(/"/, "").replace(/&amp.+/, "");
      if (dcId.indexOf("dcinside") == 0) {
        dcId = String(dcId.match(/\/\w+\/\d+/)).replace(/\/\d+.+/, "").replace("/", "");
      }

      // 해당 갤러리의 개념글 끝 페이지를 탐색
      let recommendedLink = "https://gall.dcinside.com/board/lists?id=" + dcId + "&exception_mode=recommend";
      if (isMiniGallery) {
        recommendedLink = "https://gall.dcinside.com/mini/board/lists?id=" + dcId + "&exception_mode=recommend";
      }
      let recommendedLinkHtml = org.jsoup.Jsoup.connect(recommendedLink).get().html();
      if (recommendedLinkHtml.indexOf("location.replace") != -1) {
        isMgallery = true;
        recommendedLink = "https://gall.dcinside.com/mgallery/board/lists?id=" + dcId + "&exception_mode=recommend";
        recommendedLinkHtml = org.jsoup.Jsoup.connect(recommendedLink).get().html();
      }
      let pgEndLink = recommendedLinkHtml.match(/page_next.+\d.+page_end/);
      let pgEnd = String(pgEndLink).match(/\d+/);

      // 페이지 랜덤
      let pageNum = Math.floor(Math.random() * pgEnd + 1);
      let data = null
      if (isMgallery) {
        data = org.jsoup.Jsoup.connect("https://gall.dcinside.com/mgallery/board/lists/?id=" + dcId + "&page=" + pageNum + "&exception_mode=recommend").get().html();
      }
      else if (isMiniGallery){
        data = org.jsoup.Jsoup.connect("https://gall.dcinside.com/mini/board/lists/?id=" + dcId + "&page=" + pageNum + "&exception_mode=recommend").get().html();
      }
      else {
        data = org.jsoup.Jsoup.connect("https://gall.dcinside.com/board/lists/?id=" + dcId + "&page=" + pageNum + "&exception_mode=recommend").get().html();
      }
      let data2 = data.match(/"gall_num">\d{1,100}/g);

      // 글 랜덤
      let postNum = Math.floor(Math.random() * data2.length);
      let data3 = null
      if (isMgallery) {
        data3 = "gall.dcinside.com/mgallery/board/view/?id=" + dcId + "&no=" + String(data2[postNum]).replace(/"gall_num">/, ""); // 랜덤글 링크
      }
      else if (isMiniGallery) {
        data3 = "gall.dcinside.com/mini/board/view/?id=" + dcId + "&no=" + String(data2[postNum]).replace(/"gall_num">/, ""); // 랜덤글 링크
      }
      else {
        data3 = "gall.dcinside.com/board/view/?id=" + dcId + "&no=" + String(data2[postNum]).replace(/"gall_num">/, "");
      }

      // 갤러리 이름 크롤링
      let galleryTitle = recommendedLinkHtml.match(/title.+title/);
      let galleryName = String(galleryTitle).replace(/title>/, "").replace(/<\/title/, "").replace(/ - 커뮤니티 포털 디시인사이드/, "");

      replier.reply("🎲 " + galleryName + " 개념글\n\n" + data3);
    } catch (error) {
      replier.reply("검색하지 못했습니다.");
    }
  }


  // 포켓몬 상성
  if (msg.indexOf("?푸키먼") == 0) {
    try {
      // 검색할 포켓몬
      let toSearch = msg.replace(/\?푸키먼 /, "");
      let toSearchUrl = toSearch.replace(/ /g, "%20");
      let searchLink = "https://pokemon.fandom.com/ko/wiki/" + toSearchUrl;

      // 포켓몬 위키 연결
      let pokemonWikiText = org.jsoup.Jsoup.connect(searchLink).get().text();

      // 포켓몬 타입
      let pokemonTypeData = pokemonWikiText.match(/\S+타입 포켓몬,/g);
      let pokemonType = String(pokemonTypeData).replace(/타입 포켓몬,/g, "").replace(/,/, ", ");

      // 방어 상성
      let attackType = pokemonWikiText.match(/\S+ (\d|0.5|0.25)+×/g);
      let attackTypeArray = new Array(Array(), Array(), Array(), Array(), Array(), Array());

      for (let i = 0; i < 18; i++) {
        let typeName = String(attackType[i].match(/[가-힣]+ /)).replace(/ /, "");
        let typeCoeff = attackType[i].match(/ (\d|0.5|0.25)×/)[1];
        if (typeCoeff == "4") {
          attackTypeArray[0].push(typeName);
        }
        else if (typeCoeff == "2") {
          attackTypeArray[1].push(typeName);
        }
        else if (typeCoeff == "1") {
          attackTypeArray[2].push(typeName);
        }
        else if (typeCoeff == "0.5") {
          attackTypeArray[3].push(typeName);
        }
        else if (typeCoeff == "0.25") {
          attackTypeArray[4].push(typeName);
        }
        else if (typeCoeff == "0") {
          attackTypeArray[5].push(typeName);
        }
      }

      let attackTypeResult = "\n"
      for (let i = 0; i < 6; i++) {
        if (attackTypeArray[i].length) {
          switch (i) {
            case 0:
              attackTypeResult += ("\n4배: " + attackTypeArray[i]);
              break;
            case 1:
              attackTypeResult += ("\n2배: " + attackTypeArray[i]);
              break;
            case 2:
              attackTypeResult += ("\n1배: " + attackTypeArray[i]);
              break;
            case 3:
              attackTypeResult += ("\n0.5배: " + attackTypeArray[i]);
              break;
            case 4:
              attackTypeResult += ("\n0.25배: " + attackTypeArray[i]);
              break;
            case 5:
              attackTypeResult += ("\n0배: " + attackTypeArray[i]);
              break;
            default:
              break;

          }
        }
      }

      // 출력
      let result = "이름: " + toSearch + "\n타입: " + pokemonType + attackTypeResult;
      replier.reply(result);

    } catch (error) {
      replier.reply("🤔 검색하지 못했습니다.");
    }
  }

  // 핑퐁 대화
  if (msg.indexOf(".") == 0) {
    msg = msg.replace(/./,"");
    let jsondata = { "request": { "query": msg } };

    function send() {
      try {
        let url = new java.net.URL("https://builder.pingpong.us/api/builder/5e1a1c75e4b010b663d37764/integration/v0.2/custom/{sessionId}");
        let con = url.openConnection();
        con.setRequestMethod("POST"); // 서버 접속 방법을 설정하세요. GET, POST, OPTIONS 등..
        con.setRequestProperty("Content-Type", "application/json; charset=utf-8"); // 서버 접속시 가져올 데이터의 형식을 지정
        con.setRequestProperty("Authorization", "Basic " + "a2V5OjBlMDY2ZjJlZTUxNmZhY2JmZDFmMGQyMThmMDJkZjkz"); // 인증키 입력. 사이트에 따라 Basic 또는 Bearer 를 사용합니다.
        con.setRequestProperty("User-Agent", "Mozilla"); // 일부 사이트의 경우 User-Agent 를 요구합니다.
        con.setRequestProperty("Accpet", "*.*"); // 일부 사이트의 경우, 이 헤더가 없으면 오류가 발생합니다.
        con.setDoOutput(true);
        let wr = new java.io.DataOutputStream(con.getOutputStream());
        let writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(wr, "UTF-8"));
        writer.write(JSON.stringify(jsondata));
        writer.close();
        wr.close();

        let responseCode = con.getResponseCode();
        let br;
        if (responseCode == 200) {
          br = new java.io.BufferedReader(new java.io.InputStreamReader(con.getInputStream()));
        } else {
          br = new java.io.BufferedReader(new java.io.InputStreamReader(con.getErrorStream()));
        }
        let inputLine;
        let response = "";
        while ((inputLine = br.readLine()) != null) {
          response += inputLine;
        }
        br.close();
        return response;
      } catch (e) {
        return e;
      }
    }


    let results = JSON.parse(send());
    replier.reply(results['response']['replies'][0]['text']);
  }


  // 코로나 라이브 현황
  if ((msg == "?코로나") || (msg == "?백신")) {
    
    try {
    
    let coronaHtml = org.jsoup.Jsoup.connect("https://coronaboard.kr/").get().html();
    let coronaKRHtml = String(coronaHtml.match(/\{[^\}]+?"🇰🇷"\}/));
    let vaccineKRData = coronaHtml.split("vaccineDataForDashboard\":")[1].split(",\"KR\"")[0];

    let testing = String(coronaKRHtml.match(/"testing":\d+/)).replace(/"testing":/,"");
    let testingPrev = String(coronaKRHtml.match(/"testing_prev":\d+/)).replace(/"testing_prev":/,"");
    let death = String(coronaKRHtml.match(/"death":\d+/)).replace(/"death":/,"");
    let deathPrev = String(coronaKRHtml.match(/"death_prev":\d+/)).replace(/"death_prev":/,"");
    let confirmed = String(coronaKRHtml.match(/"confirmed":\d+/)).replace(/"confirmed":/,"");
    let confirmedPrev = String(coronaKRHtml.match(/"confirmed_prev":\d+/)).replace(/"confirmed_prev":/,"");
    let negative = String(coronaKRHtml.match(/"negative":\d+/)).replace(/"negative":/,"");
    let negativePrev = String(coronaKRHtml.match(/"negative_prev":\d+/)).replace(/"negative_prev":/,"");
    let released = String(coronaKRHtml.match(/"released":\d+/)).replace(/"released":/,"");
    let releasedPrev = String(coronaKRHtml.match(/"released_prev":\d+/)).replace(/"released_prev":/,"");

    let vaccine = new Array();
    vaccine[0] = vaccineKRData.split("아스트라제네카\":")[1].split("},")[0] + "}";
    vaccine[1] = vaccineKRData.split("화이자\":")[1].split("},")[0] + "}";
    vaccine[2] = vaccineKRData.split("모더나\":")[1].split("},")[0] + "}";
    vaccine[3] = vaccineKRData.split("얀센\":")[1].split("},")[0] + "}";
    vaccine[4] = vaccineKRData.split("합계\":")[1].split("},")[0] + "}";
    // 0 AZ, 1 화이자, 2 모더나, 3 얀센, 4 합계

    let vaccinated = new Array();
    for(i = 0; i < vaccine.length; i++){ //
      vaccinated[i] = new Array();
      vaccinated[i][0] = String(vaccine[i].match(/"vaccinatedOnce":\d+/)).replace(/"vaccinatedOnce":/,"");
      vaccinated[i][1] = String(vaccine[i].match(/"vaccinatedOnce_prev":\d+/)).replace(/"vaccinatedOnce_prev":/,"");
      vaccinated[i][2] = String(vaccine[i].match(/"vacciatendFully":\d+/)).replace(/"vacciatendFully":/,""); // vaccinated가 vacciatend로 오타나있음;;
      vaccinated[i][3] = String(vaccine[i].match(/"vacciantedFully_prev":\d+/)).replace(/"vacciantedFully_prev":/,""); // 여긴 vaccinated가 vaccianted로 오타나있음;;
    }
    vaccinated[4][0] = String(vaccine[4].match(/"vaccinatedOnce":\d+/)).replace(/"vaccinatedOnce":/,"");
    vaccinated[4][1] = String(vaccine[4].match(/"vaccinatedOnce_prev":\d+/)).replace(/"vaccinatedOnce_prev":/,"");
    vaccinated[4][2] = String(vaccine[4].match(/"vaccinatedFully":\d+/)).replace(/"vaccinatedFully":/,"");
    vaccinated[4][3] = String(vaccine[4].match(/"vaccinatedFully_prev":\d+/)).replace(/"vaccinatedFully_prev":/,""); // 합계는 또 정상임ㅋㅋ

    let change = new Array();
    change[0] = testing - testingPrev; // 검사중
    change[1] = death - deathPrev; // 사망자
    change[2] = confirmed - confirmedPrev; // 확진자
    change[3] = negative - negativePrev; // 결과음성
    change[4] = released - releasedPrev; // 격리해제

    for(i = 0; i < vaccine.length; i++){
      change.push(vaccinated[i][0] - vaccinated[i][1]); // 1차접종: 5 AZ, 7 화이자. 9 모더나, 11 얀센, 13 합계
      change.push(vaccinated[i][2] - vaccinated[i][3]); // 2차접종: 6 AZ, 8 화이자, 9 모더나, 12 얀센, 14 합계 (얀센은 1차 2차 같음)
    }

    for(i = 0; i < change.length; i++){
      if(change[i] == 0){
        change[i] = " (-)";
      }
      else if(change[i] < 0){
        change[i] *= -1
        change[i] = " (-" + change[i] + ")";
      }
      else{
        change[i] = " (+" + change[i] + ")";
      }
    }

    let toReply = "😷 대한민국 코로나19 현황\
    \n\n확진자 " + confirmed + change[2] + "\
    \n사망자 " + death + change[1] + "\
    \n\n💉 백신 접종 현황\
    \n\n1차 접종 " + vaccinated[4][0] + change[13] + "\
    \n2차 접종 " + vaccinated[4][2] + change[14] + "\
    \n\n세부 현황을 보시려면 '?백신'을 입력해주세요.";
    
    if(msg == "?백신"){
      toReply = "💉 대한민국 백신 접종 현황\
      \n\n1차 접종 " + vaccinated[4][0] + change[13] + "\
      \n2차 접종 " + vaccinated[4][2] + change[14] + "\
      \n\n💊 아스트라제네카\
      \n1차 접종 " + vaccinated[0][0] + change[5] + "\
      \n2차 접종 " + vaccinated[0][2] + change[6] + "\
      \n\n💊 화이자\
      \n1차 접종 " + vaccinated[1][0] + change[7] + "\
      \n2차 접종 " + vaccinated[1][2] + change[8] + "\
      \n\n💊 모더나\
      \n1차 접종 " + vaccinated[2][0] + change[9] + "\
      \n2차 접종 " + vaccinated[2][2] + change[10] + "\
      \n\n💊 얀센\
      \n접종 완료 " + vaccinated[3][2] + change[12];
    }

    replier.reply(toReply);
    
    } catch (error) {
      replier.reply("오류가 발생했습니다. 다시 시도해주세요.");
    }
  }


  // 카카오링크 테스트
  if (msg.indexOf("채권추심") == 0) {
    Kakao.sendLink(room,{
      "link_ver" : "4.0",
      "template_id" : 60941,
      "template_args" : {
      }
      }, "custom");
  }

  if (msg.indexOf("#이제규") == 0) {
    Kakao.sendLink(room,{
      "link_ver" : "4.0",
      "template_id" : 78898,
      "template_args" : {
      }
      }, "custom");
  }

  // 맛집 추천
  if(msg.startsWith("?맛집 ")){
    const base = "https://www.siksinhot.com/search?keywords=";
    const Jsoup = org.jsoup.Jsoup.connect;

    search = msg.substr(4);
    const parse = base + search;
    let start = Jsoup(parse).get()
    
    //img parse
    let i1 = start.select("span[class*=img] > img").get(0).attr("src");
    let i2 = start.select("span[class*=img] > img").get(1).attr("src");
    let i3 = start.select("span[class*=img] > img").get(2).attr("src");
    let i4 = start.select("span[class*=img] > img").get(3).attr("src");
    let i5 = start.select("span[class*=img] > img").get(4).attr("src");
    
    //store name parse
    let n1 = start.select("div.cnt").get(0).select("strong.store").get(0).text();
    let n2 = start.select("div.cnt").get(1).select("strong.store").get(0).text();
    let n3 = start.select("div.cnt").get(2).select("strong.store").get(0).text();
    let n4 = start.select("div.cnt").get(3).select("strong.store").get(0).text();
    let n5 = start.select("div.cnt").get(4).select("strong.store").get(0).text();
    
    //menu parse
    let m1 = start.select("div.cnt").get(0).select("p").get(0).text();
    let m2 = start.select("div.cnt").get(1).select("p").get(0).text();
    let m3 = start.select("div.cnt").get(2).select("p").get(0).text();
    let m4 = start.select("div.cnt").get(3).select("p").get(0).text();
    let m5 = start.select("div.cnt").get(4).select("p").get(0).text();
    
    //link parse
    let l1 = start.select("div[class*=cont] > a").get(0).attr("href");
    let l2 = start.select("div[class*=cont] > a").get(1).attr("href");
    let l3 = start.select("div[class*=cont] > a").get(2).attr("href");
    let l4 = start.select("div[class*=cont] > a").get(3).attr("href");
    let l5 = start.select("div[class*=cont] > a").get(4).attr("href");
    
    /** parse end **/
    
    //kakaolink
    Kakao.sendLink(room, {
    "template_id": 61008,
    "template_args": {
    "i1" : i1, "i2" : i2, "i3" : i3, "i4" : i4, "i5" : i5,
    "n1" : n1, "n2" : n2, "n3" : n3, "n4" : n4, "n5" : n5,
    "m1" : m1, "m2" : m2, "m3" : m3, "m4" : m4, "m5" : m5,
    "l1" : l1, "l2" : l2, "l3" : l3, "l4" : l4, "l5" : l5,
    "keyword" : search
    }
    },
    'custom');
    }


  // 실검
  if(msg.indexOf("?실검") == 0){
    let realTimeRank = org.jsoup.Jsoup.connect("https://api.signal.bz/news/realtime").ignoreContentType(true).ignoreHttpErrors(true).get().wholeText();
    const obj = JSON.parse(realTimeRank);
    const top10 = obj["top10"];

    let n1 = top10[0].keyword;
    let n2 = top10[1].keyword;
    let n3 = top10[2].keyword;
    let n4 = top10[3].keyword;
    let n5 = top10[4].keyword;

    const naverLink = "search.naver?query="
    let l1 = naverLink + n1;
    let l2 = naverLink + n2;
    let l3 = naverLink + n3;
    let l4 = naverLink + n4;
    let l5 = naverLink + n5;

    //kakaolink
    Kakao.sendLink(room, {
      "template_id": 64173,
      "template_args": {
      "n1" : n1, "n2" : n2, "n3" : n3, "n4" : n4, "n5" : n5,
      "l1" : l1, "l2" : l2, "l3" : l3, "l4" : l4, "l5" : l5,
      }
      },
      'custom');
  }

  // 로아
  if (msg.indexOf("?로아") == 0) {
    let toSearch = msg.replace(/\?로아 /, "");
    let data0 = org.jsoup.Jsoup.connect("https://lostark.game.onstove.com/Profile/Character/" + toSearch).get();
    let data = data0.select("div.profile-ingame");
    let lv = data.select("div.level-info").select("span");
    let lv_ex = lv.get(1).ownText();
    let lv_ba = lv.get(3).ownText();
    let lv_it = data.select("div.level-info2").select("span").get(1).ownText();
    let info = data.select("div.game-info").select("span");
    let title = info.get(1).text();
    let guild = info.get(3).text();
    let pvp = info.get(5).text();
    let job = data0.select("img.profile-character-info__img").attr("alt");
    let server = data0.select("span.profile-character-info__server").text().replace("@", "");
    let stat = data.select("div.profile-ability-battle").select("span");
    let stat_crit = stat.get(1).ownText();
    let stat_teuk = stat.get(3).ownText();
    let stat_fast = stat.get(7).ownText();
    let gakin = data.select("div.profile-ability-engrave").select("span");
    let gakintext = String(gakin).replace(/<span>/g, "").replace(/<\/span>/g, "");
    let result = "이름: " + toSearch +
        "\n직업: " + job +
        "\n서버: " + server +
        "\n전투/원정대 레벨: " + lv_ba + " / " + lv_ex +
        "\n아이템 레벨: " + lv_it +
        "\n\n치명 " + stat_crit + " 특화 " + stat_teuk + " 신속 " + stat_fast +
        "\n\n" + gakintext;
    // if (guild != "-") result += "\n길드 : " + guild;
    replier.reply("[로스트아크 캐릭터 정보]\n\n" + result);
  }


  // 올려
  if (msg == "?올려") {
    for (i = 0; i < 15; i++) {
      replier.reply("☝🏻 올려! ☝🏻");
    }
  }

  // 올려 개수
  if (msg.indexOf("?올려 ") == 0) {
    let howMany = msg.replace(/\?올려 /, "").replace(/ /g, "")
    if (howMany > 30) {
      replier.reply("고장나요");
    }
    else if (howMany > 15) {
      replier.reply("싫어");
    }
    else {
      for (i = 0; i < howMany; i++) {
        replier.reply("☝🏻 올려! ☝🏻");
      }
    }
  }


  // 맞춤법 꼽주기
  if (msg.indexOf("됬") !== -1) {
    let toReply = ""
    for (i = 0; i < 36; i++) {
      toReply += "됐"
    }
    replier.reply(toReply);
  }

  if (msg.indexOf("됌") !== -1) {
    let toReply = ""
    for (i = 0; i < 36; i++) {
      toReply += "됨"
    }
    replier.reply(toReply);
  }

  if (msg.indexOf("됀") !== -1) {
    let toReply = ""
    for (i = 0; i < 36; i++) {
      toReply += "된"
    }
    replier.reply(toReply);
  }

  if (msg.indexOf("몇일") !== -1) {
    let toReply = ""
    for (i = 0; i < 36; i++) {
      toReply += "며칠"
    }
    replier.reply(toReply);
  }


  // 랜덤번역
  if (Math.random() < 0.01) {
    translate = Api.papagoTranslate('ko', 'en', msg);
    replier.reply(translate)
  }

}


// 현재시간 함수
function nowTime() {
  // 현재시간
  let d = new Date();
  // 오전 오후 표시
  let ampm = "오후 ";
  let hour = d.getHours();
  if (hour < 12) {
    ampm = "오전 ";
  }
  else if (hour > 12) {
    hour -= 12;
  }
  return (d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + ampm + hour + "시 " + d.getMinutes() + "분");
}

// 요일 출력 함수
function getInputDayLabel(date) {
    
  let week = new Array('일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일');
  
  let today = new Date(date).getDay();
  let todayLabel = week[today];
  
  return todayLabel;
}

// 조사 변환 함수
function Josa(txt, josa) {
  let code = txt.charCodeAt(txt.length - 1) - 44032;
  let cho = 19, jung = 21, jong = 28;
  let i1, i2, code1, code2;

  // 원본 문구가 없을때는 빈 문자열 반환
  if (txt.length == 0) return '';

  // 한글이 아닐때
  if (code < 0 || code > 11171) return txt;

  if (code % 28 == 0) return txt + Josa.get(josa, false);
  else return txt + Josa.get(josa, true);
}
Josa.get = function (josa, jong) {
  // jong : true면 받침있음, false면 받침없음

  if (josa == '을' || josa == '를') return (jong ? '을' : '를');
  if (josa == '이' || josa == '가') return (jong ? '이' : '가');
  if (josa == '은' || josa == '는') return (jong ? '은' : '는');
  if (josa == '와' || josa == '과') return (jong ? '와' : '과');

  // 알 수 없는 조사
  return '**';
}


//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  let textView = new android.widget.TextView(activity);
  textView.setText("Hello, World!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}