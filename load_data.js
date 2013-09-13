(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    BBClient.ready(function(fhirClient){

      var pt = fhirClient.get({
        resource: 'patient',
        id: fhirClient.patientId
      });

      var labs = fhirClient.search({
        resource: 'observation',
        searchTerms: {
          subject: 'patient/@'+fhirClient.patientId,
          'name:anyns' : '30522-7,14647-2,2093-3,2085-9' 
        }
      });

      $.when(pt, labs).done(function(patient, labs_result){

        var labs = labs_result[0];
        console.log(patient, labs);

        var gender = patient.gender.coding[0];
          gender = gender.code == 'M' ? 'male' : 'female';

          dob = new XDate(patient.birthDate);
          age = Math.floor(dob.diffYears(new XDate()));

          var fname = patient.name[0].given.join(" "),
          lname = patient.name[0].family.join(" ");

          function byLoinc(){
            var loincs = [];
            for (var i=0;i<arguments.length;i++){
              loincs.push(arguments[i]);
            }
            var ret = [];
            $.each(labs, function(i,l){
              var loinc = bySystem(l.name, 'http://loinc.org');
                if (loinc && loincs.indexOf(loinc.code) !== -1) {
                  ret.push(l);
                }
            });
            return ret;
          };

          var hscrp = byLoinc("30522-7");
          var cholesterol = byLoinc("14647-2", "2093-3");
          var hdl = byLoinc("2085-9");

          var missingData = [];
          if (hscrp.length == 0) {
            missingData = missingData.concat(["hs-CRP"]);
          }
          if (cholesterol.length == 0) {
            missingData = missingData.concat(["Cholesterol"]);
          }
          if (hdl.length == 0) {
            missingData = missingData.concat(["HDL"]);
          }
          if (missingData.length > 0) {
            var missingDataMessage = "No results (";
              var delimiter = "";
              for(var i = 0; i < missingData.length; i++) {
                missingDataMessage += delimiter + missingData[i];
                delimiter = ", ";
              }
      missingDataMessage += ") for " + fname + " " + lname + ".";
      alert(missingDataMessage);
          }

          p = defaultPatient();
          p.birthday = {value:dob};
          p.age = {value:age};
          p.gender={value:gender};
          p.givenName={value:fname};
          p.familyName={value:lname};
          p.hsCRP={value:hscrp_in_mg_per_l(hscrp[0])};
          p.cholesterol={value:cholesterol_in_mg_per_dl(cholesterol[0])};
          p.HDL={value:cholesterol_in_mg_per_dl(hdl[0])};
          p.LDL = {value:p.cholesterol.value-p.HDL.value};

          ret.resolve(p);
      });
      console.log("FhirClient created", fhirClient);
    });
    return ret.promise();
  };

  function defaultPatient(){
    return {
      sbp: {value: 120},
      smoker_p: {value: false},
      fx_of_mi_p: {value: false}
    }
  };

  /**
  * Unit conversion formula.
  * See values at http://www.amamanualofstyle.com/page/si-conversion-calculator
  */
  cholesterol_in_mg_per_dl = function(v){
    if (v.valueQuantity.units === "mg/dL"){
      return parseFloat(v.valueQuantity.value);
    }
    else if (v.valueQuantity.units === "mmol/L"){
      return parseFloat(v.valueQuantity.value)/ 0.026;
    }
    throw "Unanticipated cholesterol units: " + v.valueQuantity.units;
  };

  /**
  * Unit conversion formula.
  * See values at http://www.amamanualofstyle.com/page/si-conversion-calculator
  */
  hscrp_in_mg_per_l = function(v){
    if (v.valueQuantity.units === "mg/L"){
      return parseFloat(v.valueQuantity.value);
    }
    else if (v.valueQuantity.units === "mmol/L"){
      return parseFloat(v.valueQuantity.value.value)/ 0.10;
    }
    throw "Unanticipated hsCRP units: " + v.valueQuantity.units;
  };

})(window);
