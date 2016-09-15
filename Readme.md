# BEIS Portfolio spending approval

## Structure

Two form viewmodels *surveyviewmodel* and *selfassessmentviewmodel*, are bound to web forms using knockout.js. Secondary functions like form validation, form submission and progress storage (in cookies) is done via jquery, but triggered by knockout.js bindings. For all of this, see surveyviewmodel.js and selfassessmentviewmodel.js, and the corresponding .jade files for the markup.

Upon submission, data is stored in airtable - see airtabledata.js

Files are uploaded and hosted temporarily so that airtable can retrieve the data using a shared secret (this happens via GET requests and is therefore vulnerable to man-in-the-middle attacks - beware!). See index.js for the implementation of this major hoopjump.

## Maintenance

### Updating Selfassessment questions

SA questions are stored in digitalstandards.json. When questions get updated in the CO Digital Standards document, the json needs to be updated as follows. To do so:

1. Go to the CO Digital Standards spreadsheet in the Portfolio Team's shared drive.
2. This has a sheet "Compiled". Export this to a JSON (use Add-ons -> Get add-ons -> "Export Sheet Data" by Chris Ingerson). Make sure to only export the "Compiled sheet"
3. Save the export in the root  as digitalstandards.json
4. Commit this code change and deploy a new version.

### Updating other form data

Financial years, directorates, existing projects and cost types are form properties that you will want to update from time to time. To do so, simply edit the arrays at the top of surveyviewmodel.js, commit your code changes and deploy a new version.

## Outstanding work

Technical and Commercial self-assessment questions need to be added.