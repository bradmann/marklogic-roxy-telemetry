# marklogic-telemetry

Telemetry is a MarkLogic Roxy Plugin that provides a simple means of capturing and displaying metrics about your application and how it's being used. Out of the box it provides:
- Metrics on how many users are hitting the application over time, including which users are most active
- Metrics on the number of documents in the system over time
- Metrics about the activities happening in the app, including the activity duration (elapsed time), overall activity over time, and the number of times each activity is performed over a specific timeframe

![](https://lh3.googleusercontent.com/-aDZWdVHAjdY/VeUT4690qZI/AAAAAAABZiE/83fNlYBU0tY/s2048-Ic42/telemetry.png)

### Installation
- Extract directly on top of your Roxy src directory.
  - Note: this project contains a version of ./roxy/router.xqy !
    - If you maintain your own ./roxy/router.xqy file, it is important that this file contain the changes that call this line:
```
tl:track(xdmp:get-current-user(), $controller-path || ":" || $func || "." || $format, $request-time, xdmp:elapsed-time())
```
- Edit your roxy project's ./deploy/ml-config.xml file and add the indexes from the following sample file:
  - ./deploy/ml-config.telemetry
- Edit src/app/config/telemetry-config.xqy with your application-specific settings.
- Re-deploy your application code using Roxy's deploy tasks:
  - ./ml \<env\> bootstrap
  - ./ml \<env\> deploy modules
- Create a scheduled task with the following settings:
  - task path: /scheduled-tasks/collect-telemetry-data.xqy
  - task root: /
  - task type: hourly
  - task period: 1
  - task database: <your app's db name>
  - task modules: <your app's modules>
  - task user: admin
  - task host: <leave blank>
  - task priority: normal

### Scheduled Task
The scheduled task runs every hour and collects the user metrics and cleans up any metrics gathered older than age limit. [See AGE-LIMIT](#telemetry-config-file) 

### Telemetry Config File
The ./app/config/telemetry-config.xqy file contains options used to customize the application to work within your target environment.  Below is a table containing some of the important/configurable settings:

Value | Description
------------ | --------------------------------------------------------------------
PORT | The port your application server.  Must have the telemetry code deployed to the target modules DB/filesystem.
AGE-LIMIT | The xs:DayTimeDuration for how long metrics will be retained and searchable within the database.  It is recommened not to exceed 365 days.
CLEANUP-LOCATION | The filesystem location on all ML Cluster hosts where older metrics will be removed from the DB and written to disk (see AGE-LIMIT.) If left blank, older data is permanently deleted.
DOCUMENT-COLLECTION | General document collection used to display ingest rate statistics in Telemetry UI.  Should match a generic collection that is tagged on all documents within your database.
DOCUMENT-DATE-FIELD | An element reference to a dateTime indexed value within the ingested documents which is used to show ingest metrics within the Telemetry UI.
HTTP-OPTIONS | XML section used to pass credentials for invoking the external REST endpoints on all ML Cluster hosts.

