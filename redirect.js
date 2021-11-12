function redirect() {
    const mobileKeyWords = new Array('iPhone', 'iPod', 'BlackBerry', 'Android', 'Windows CE', 'Windows CE;', 'LG', 'MOT', 'SAMSUNG', 'SonyEricsson', 'Mobile', 'Symbian', 'Opera Mobi', 'Opera Mini', 'IEmobile');
    for (const word in mobileKeyWords){
        if (navigator.userAgent.match(mobileKeyWords[word]) != null){
                window.location.href = "./mobile.html";
            break;
        }
    }
}

redirect()
