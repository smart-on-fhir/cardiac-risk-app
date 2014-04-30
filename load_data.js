(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    FHIR.oauth2.ready(function(smart){

      var pt = smart.Patient.read();

      var labs = smart.Observation.where
                .nameIn('30522-7', '14647-2', '2093-3', '2085-9', '8480-6')
                .search();

      $.when(pt, labs).done(function(patient, labs_result){

        var labs = labs_result[0];
        var byCodes = smart.byCodes(labs, 'name');
        console.log(patient, labs);

        var gender = patient.gender.coding[0];
          gender = gender.code == 'M' ? 'male' : 'female';

          dob = new XDate(patient.birthDate);
          age = Math.floor(dob.diffYears(new XDate()));

          var fname = patient.name[0].given.join(" "),
          lname = patient.name[0].family.join(" ");


          var hscrp = byCodes("30522-7");
          var cholesterol = byCodes("14647-2", "2093-3");
          var hdl = byCodes("2085-9");
          var systolic = byCodes("8480-6");

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

          // default logic for demonstration purposes
          if (systolic.length == 0) {
            systolic = "120";
          } else {
            systolic = systolic[0].valueQuantity.value;
            if (systolic < 105) {
              systolic = 105
            }
            if (systolic > 200) {
              systolic = 200;
            }
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
            return ret.reject();
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
          p.sbp = {value:systolic};

          ret.resolve(p);
      });
      console.log("FhirClient created", smart);
    });
    return ret.promise();
  };

  function defaultPatient(){
    return {
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
