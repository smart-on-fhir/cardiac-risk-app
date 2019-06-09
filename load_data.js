(function(window) {

  function flatten(pages) {
    return pages.reduce(function(prev, cur) {
      prev = prev.concat(cur.entry.map(function(entry) {
        return entry.resource;
      }));
      return prev;
    }, []);
  }

  function makeArray(x) {
    if (!Array.isArray(x)) {
      return [x];
    }
    return x;
  }

  function getPatientName(patient) {
    var name  = makeArray(patient.name);
    var fname = makeArray(name[0].given  || "").join(" ");
    var lname = makeArray(name[0].family || "").join(" ");
    return {
      given : fname,
      family: lname
    };
  }

  window.extractData = function() {

    return FHIR.oauth2.ready().then(function(client) {

      // Fetch the patient
      var patientQuery = client.patient.read();

      // Fetch the observations
      var labsQuery = (function() {
        var query = new URLSearchParams();
        query.set("patient", client.patient.id);
        query.set("code", [
          'http://loinc.org|30522-7', // hscrp
          'http://loinc.org|14647-2', // cholesterol
          'http://loinc.org|2093-3',  // cholesterol
          'http://loinc.org|2085-9',  // hdl
          'http://loinc.org|8480-6'   // systolic
        ].join(","));
        return client.request("Observation?" + query, { pageLimit: 0 });
      })()

      return Promise.all([ patientQuery, labsQuery ]).then(function(data) {
        
        var patient = data[0];

        if (!patient.birthDate) {
          alert("Unknown patient.birthDate");
          throw new Error("Unknown patient.birthDate");
        }

        if (!patient.gender) {
          alert("Unknown patient.gender");
          throw new Error("Unknown patient.gender");
        }

        // The labs result is an array of (zero or more) pages. Convert it to
        // flat array of resources.
        var labs = flatten(data[1]);

        var byCodes = client.byCodes(labs, 'code');

        var gender = patient.gender;

        dob = new XDate(patient.birthDate);
        age = Math.floor(dob.diffYears(new XDate()));

        var name = getPatientName(patient);
        var fname = name.given;
        var lname = name.family;


        var hscrp       = byCodes("30522-7");
        var cholesterol = byCodes("14647-2", "2093-3");
        var hdl         = byCodes("2085-9");
        var systolic    = byCodes("8480-6");

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
          throw new Error(missingDataMessage);
        }

        p = defaultPatient();
        p.birthday    = { value: dob };
        p.age         = { value: age };
        p.gender      = { value: gender };
        p.givenName   = { value: fname };
        p.familyName  = { value: lname };
        p.hsCRP       = { value: hscrp_in_mg_per_l(hscrp[0]) };
        p.cholesterol = { value: cholesterol_in_mg_per_dl(cholesterol[0]) };
        p.HDL         = { value: cholesterol_in_mg_per_dl(hdl[0]) };
        p.LDL         = { value: p.cholesterol.value-p.HDL.value };
        p.sbp         = { value: systolic };
        return p;
      });
    });
  };

  function defaultPatient(){
    return {
      smoker_p  : { value: false },
      fx_of_mi_p: { value: false }
    }
  };

  /**
  * Unit conversion formula.
  * See values at http://www.amamanualofstyle.com/page/si-conversion-calculator
  */
  cholesterol_in_mg_per_dl = function(v){
    if (v.valueQuantity.unit === "mg/dL"){
      return parseFloat(v.valueQuantity.value);
    }
    else if (v.valueQuantity.unit === "mmol/L"){
      return parseFloat(v.valueQuantity.value)/ 0.026;
    }
    throw "Unanticipated cholesterol units: " + v.valueQuantity.unit;
  };

  /**
  * Unit conversion formula.
  * See values at http://www.amamanualofstyle.com/page/si-conversion-calculator
  */
  hscrp_in_mg_per_l = function(v){
    if (v.valueQuantity.unit === "mg/L"){
      return parseFloat(v.valueQuantity.value);
    }
    else if (v.valueQuantity.unit === "mmol/L"){
      return parseFloat(v.valueQuantity.value.value)/ 0.10;
    }
    throw "Unanticipated hsCRP units: " + v.valueQuantity.unit;
  };

})(window);
