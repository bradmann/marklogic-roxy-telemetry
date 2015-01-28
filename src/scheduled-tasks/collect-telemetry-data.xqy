xquery version "1.0-ml";
import module namespace tl = "http://marklogic.com/telemetry-lib" at "/app/models/telemetry-lib.xqy";
import module namespace tc = "http://marklogic.com/telemetry/config" at "/app/config/telemetry-config.xqy";

declare variable $port := $tc:PORT;
declare variable $servername := xdmp:host-name(xdmp:host());

declare variable $collect-url := 'http://' || $servername || ":" || $port || "/telemetry/collect.json";
declare variable $cleanup-url := 'http://' || $servername || ":" || $port || "/telemetry/cleanup.json";

xdmp:http-post($collect-url, $tc:HTTP-OPTIONS, ()),
xdmp:http-post($cleanup-url, $tc:HTTP-OPTIONS, ())
