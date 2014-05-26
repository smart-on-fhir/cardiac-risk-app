var fhirServiceUrl = getParameterByName("iss");

var client = {
  "client_id": "cardiac_risk",
  "redirect_uri": relative("index.html"),
  "scope":  "patient/*.read launch:" + getParameterByName("launch")
};


FHIR.oauth2.authorize({
  server: fhirServiceUrl,
  client: client
});

function relative(url){
  return (window.location.protocol + "//" + window.location.host + window.location.pathname).match(/(.*\/)[^\/]*/)[1] + url;
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}
