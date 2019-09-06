formatAMPM = function(time) {
    return time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}            
insertChat = function(who, text){
    
    var elementLi = "";
    var date = formatAMPM(new Date());
    
    if (who == "me"){
        elementLi = '<li class="me"><div class="text text-r">'+text+'</div><div class="date">'+date+'</div><div class="tirangle-m"></div></li>';                   
    }else{
        elementLi = '<li class="opponent"><div class="tirangle-o"></div><div class="text text-r">'+text+'</div><div class="date">'+date+'</div></li>';
    }
                       
    $("#messages-list").append(elementLi);
    scroll();
}

resetChat = function(){
    $("#messages-list").empty();
}

scroll = function(){
    var objDiv = document.getElementById("messages-list");
    objDiv.scrollTop = objDiv.scrollHeight;
}



