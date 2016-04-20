xquery version "1.0-ml";

import module namespace vh = "http://marklogic.com/roxy/view-helper" at "/roxy/lib/view-helper.xqy";
import module namespace form = "http://marklogic.com/roxy/form-lib" at "/app/views/helpers/form-lib.xqy";

declare namespace g = "http://marklogic.com/xdmp/group";

declare option xdmp:mapping "false";

(: use the vh:required method to force a variable to be passed. it will throw an error
 : if the variable is not provided by the controller :)
(:
  declare variable $title as xs:string := vh:required("title");
    or
  let $title as xs:string := vh:required("title");
:)

(: grab optional data :)
(:
  declare variable $stuff := vh:get("stuff");
    or
  let $stuff := vh:get("stuff")
:)

declare variable $action-list := vh:get("action-list");

'<!DOCTYPE html>',
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Telemetry</title>

    <!-- Bootstrap -->
    <link href="../public/css/bootstrap.min.css" rel="stylesheet"/>
    <link href="../public/css/telemetry.css" rel="stylesheet"/>

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="../public/js/lib/html5shiv.js"></script>
      <script src="../public/js/lib/respond.min.js"></script>
    <![endif]-->
  </head>
  <body>
    <nav class="navbar navbar-inverse navbar-static-top" role="navigation">
      <div class="container-fluid">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">Telemetry</a>
        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
          <ul class="nav navbar-nav">
            <li class="active"><a href="#tab1" data-toggle="tab">User Metrics</a></li>
            <li><a href="#tab2" data-toggle="tab">Request Metrics</a></li>
          </ul>
        </div><!-- /.navbar-collapse -->
      </div><!-- /.container-fluid -->
    </nav>

    <div class="tab-content">
      <div id="tab1" class="tab-pane container-fluid active">
        <div class="col-md-10 col-md-offset-1">
          <!--<div class="row">-->
            <div class="col-md-6">
              <div class="panel panel-default" id="topusers_panel">
                <div class="panel-heading">
                  <span class="pull-right">
                    <select id="topusers_duration_select">
                      <option value="1">Today</option>
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                      <option value="365">Last 365 days</option>
                    </select>
                  </span>
                  <h3 class="panel-title">Top Users</h3>
                </div>
                <table class="table table-striped table-condensed small">
                  <thead><tr><th>#</th><th>user</th><th>requests</th></tr></thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>
          <!--</div>-->
          <!--<div class="row">-->
            <div class="chart_wrapper col-md-6">
              <div id="unique_users_detail_chart">
              </div>
            </div>
          <!--</div>-->
          <!--<div class="row">-->
            <div class="chart_wrapper col-md-6">
              <div id="document_ingest_chart">
              </div>
            </div>
          <!--</div>-->
        </div>
      </div>

      <div id="tab2" class="tab-pane container-fluid">
        <div class="col-md-10 col-md-offset-1">
          <div class="chart_wrapper">
            <div id="action_summary_chart">
            </div>
          </div>
          <div class="chart_wrapper">
            <div id="action_chart">
            </div>
            <select id="action_duration_select" class="chart_select">
              <option value="1">Today</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last 365 days</option>
            </select>
          </div>
          <div class="chart_wrapper">
            <div id="action_timeseries_chart">
            </div>
            <select id="action_select" class="chart_select">
            {
              for $action in $action-list
              let $action-name := fn:tokenize($action, "/")[fn:last()]
              order by $action-name
              return <option value="{$action}">{$action-name}</option>
            }
            </select>
          </div>
          <div class="chart_wrapper">
            <div id="action_time_chart">
            </div>
            <select id="action_time_duration_select" class="chart_select">
              <option value="1">Today</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last 365 days</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="navbar navbar-fixed-bottom">
      <div id="alert_message" class="alert alert-info" style="display: none">
        <span id="alert_message_text">This is an alert message.</span>
        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
      </div>
    </div>

		<script src="../js/lib/jquery-1.7.1.min.js" type="text/javascript"></script>
		<script src="../js/lib/jquery.cookie.js" type="text/javascript"></script>

    <script src="../js/lib/bootstrap.min.js" type="text/javascript"></script>
    <script src="../js/lib/highcharts.js" type="text/javascript"></script>
    <script src="../js/lib/highcharts-more.js" type="text/javascript"></script>
    <script src="../js/lib/modules/drilldown.js" type="text/javascript"></script>
    <script src="../js/telemetry.js" type="text/javascript"></script>
  </body>
</html>