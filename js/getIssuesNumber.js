function loadIssuesNumber(whereToPut) {
    var xmlhttp,
        x;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            x = JSON.parse(xmlhttp.responseText);
            whereToPut = x;
            console.log(x);
        }
    }
    xmlhttp.open("GET", "https://api.github.com/repos/hibooboo2/react_Tetris/issues", false);
    xmlhttp.send();
    return x;
}
