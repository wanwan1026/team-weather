

// 剩餘 從明天為第一天


const CWB_API_KEY="CWB-2EF6C203-2256-404D-AD80-5E9DE0982C6A";
// 所有縣市資料
let records=null;

// 要呈現的資料
let cityRecords = [];


function getRecords(){
    return fetch("https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=CWB-2EF6C203-2256-404D-AD80-5E9DE0982C6A&format=JSON").then((response)=>{
            return response.json();
            }).then((data)=>{
                records=data.records.locations[0].location;
            });
}


function getCityRecords(cityName='臺北市'){

    cityRecords = [];

    //利用every return flase就結束的特性  找出縣市資料即停止loop 
    records.every(city => {   
        if(city.locationName === cityName){
            city.weatherElement.forEach(item => {
                if(item.description === '12小時降雨機率' || item.description === '平均溫度' || item.description === '最低溫度' ||
                   item.description === '紫外線指數' || item.description === '最高溫度' || item.description === '天氣現象'){

                    cityRecords.push(item)
                }
            })
            return false;
        }
        return true
    }) 
}

function renderContent(cityName='臺北市'){
    
    // render header
    let header = document.querySelector('.header');
    let h1 = document.createElement('h1')
    h1.textContent = cityName;
    header.appendChild(h1);

    // 五天
    for(let day=1; day<=5 ;day++){
            
            let content = document.querySelector('#content');
            let card = document.createElement('div');

            let date = document.createElement('h3');

            let morningTitle = document.createElement('h4');
            let nightTitle = document.createElement('h4');

            let morningDIV = document.createElement('div');
            let nightDIV = document.createElement('div');


            morningTitle.textContent = `早上`;
            nightTitle.textContent = '晚上';
            
            
            card.classList.add('week');
            morningDIV.classList.add('week-up');
            nightDIV.classList.add('week-down');
            morningTitle.classList.add('week-tx1-1');
            nightTitle.classList.add('week-tx1-1');
            
        
            let startIndex = null;
            if(startIndex===null){
                startIndex = cityRecords[0].time.findIndex((time, index) => {
                    return  time.startTime.split(" ")[1] === '06:00:00';           
                })
            }
            //印出日期 
            startIndex = startIndex + ((day-1)*2); 
            let dateString = cityRecords[0].time[startIndex].startTime.split(/[\-,\ ]/);
            date.classList.add('week-tx1');
            date.textContent = `${dateString[1]}月${dateString[2]}號`;

            morningDIV.appendChild(date);
            morningDIV.appendChild(morningTitle);
            nightDIV.appendChild(nightTitle);


        // 六項資料跑五天 30筆
        cityRecords.forEach((data, index) => {

            // 加入紫外線指數
            if(data.time.length === 7){
                let p = document.createElement('p')
                p.classList.add('week-tx')
                p.textContent = `紫外線指數 : ${data.time[day].elementValue[0].value}`;
                morningDIV.appendChild(p);
                card.appendChild(morningDIV);
                content.appendChild(card);
                return;
            }           
            
            // 利用startIndex 取得兩筆(一天) 
            for(let i = startIndex ; i<startIndex+2 ; i++){
                
                let p = document.createElement('p');
                p.classList.add('week-tx')
                // 有些資料不齊全 避免error停止運作
                try{
                    p.textContent = `${data.description} : ${data.time[i].elementValue[0].value}`
                    if( i%2 === 0){
                        morningDIV.appendChild(p);
                    }
                    else{
                        nightDIV.appendChild(p)
                    }
                }
                catch(e){
                    continue;
                }
                
            }
            
            card.appendChild(morningDIV);
            card.appendChild(nightDIV);
            content.appendChild(card);       
        })
    }
}

async function init(){
    await getRecords();
    getCityRecords();  
    renderContent('臺北市');
}


function resetContent(){
    let content = document.querySelector('#content');
    let header = document.querySelector('.header');
    content.innerHTML ="";
    header.innerHTML ="";
}

init();


document.querySelectorAll('.city').forEach(item => {
    item.addEventListener('click', function(e){
        
        getCityRecords(e.target.textContent)
        resetContent();
        renderContent(e.target.textContent);
        
    })
})
