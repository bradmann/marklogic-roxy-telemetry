# marklogic-telemetry

Telemetry is a MarkLogic Roxy Plugin that provides a simple means of capturing and displaying metrics about your application and how it's being used. Out of the box it provides:
- Metrics on how many users are hitting the application over time, including which users are most active
- Metrics on the number of documents in the system over time
- Metrics about the activities happening in the app, including the activity duration (elapsed time), overall activity over time, and the number of times each activity is performed over a specific timeframe

![](https://lh3.googleusercontent.com/-aDZWdVHAjdY/VeUT4690qZI/AAAAAAABZiE/83fNlYBU0tY/s2048-Ic42/telemetry.png)

### Installation
- Extract directly on top of your Roxy src directory.
- Edit src/app/config/telemetry-config.xqy with your application-specific settings.
- Re-deploy your application code using Roxy's deploy syntax (./ml <env> deploy modules)
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
