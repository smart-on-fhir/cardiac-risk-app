var fhirServiceUrl = getParameterByName("fhirServiceUrl");

var client = {
  "client_name": "SMART Cardiac Risk",
  "client_uri": "http://smartplatforms.org/smart-app-gallery/cardiac-risk/",
  "logo_uri": "http://smartplatforms.org/wp-content/uploads/2012/09/cardiac-risk-216x300.png",
  "contacts": [ "info@smartplatforms.org" ],
  "redirect_uris": [ relative("index.html")],
  "response_types": ["token"],
  "grant_types": ["implicit"],
  "token_endpoint_auth_method": "none",
  "scope":  "summary search"
};

BBClient.providers(["https://bbplus-static-registry.aws.af.cm/"], function(providers){

  var matched;

  var matching = providers.filter(function(p){
    // TODO remove debug clause
    return (
      p.bb_api.fhir_service_url === fhirServiceUrl || 
      (fhirServiceUrl.match(/localhost/) && p.url === "http://localhost:8080/openid-connect-server")
    );
  });

  if (matching.length === 1) {
    matched = matching[0];
    //TODO remove debug clause
    matched.bb_api.fhir_service_uri = fhirServiceUrl;
  } else if (matching.length === 0) {
    matched = BBClient.noAuthFhirProvider(fhirServiceUrl);
  } else {
    throw "Found >1 match for " + fhirServiceUrl;
  }

  BBClient.authorize({
    client: client, 
    provider: matched,
    patientId: getParameterByName("patientId")
  });
});

function relative(url){
  return (window.location.origin + window.location.pathname).match(/(.*\/)[^\/]*/)[1] + url;
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
