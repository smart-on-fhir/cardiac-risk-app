# About #
A port of the [Cardiac Risk Visualization SMART Application](https://github.com/chb/smart_sample_apps/tree/0f8afd5036326f68cfb9bacf9d20d2bf3d5dd7ed/static/framework/cardio_risk_viz
) to use an [HL7 FHIR](http://www.hl7.org/implement/standards/fhir/index.htm) v0.10 data source for [lab reports](http://www.hl7.org/implement/standards/fhir/diagnosticreport.htm
) and [patient demographics](http://www.hl7.org/implement/standards/fhir/Patient.htm).

# Deploy #

From a console in the project directory, execute:

```gradlew jettyRun```

# Use #
Open browser to Risk Visualization for [Everywoman Eve](http://localhost:8000/smartapp?personId=1).

# Data Source #
The current data source is Grahame Grieve's HL7 FHIR [reference implementation](http://hl7connect.healthintersections.com.au/svc/fhir).

# Screenshot #

![Screenshot](https://raw.github.com/sethrylan/fhir_cardiac_risk/gh-pages/screenshot.png)
