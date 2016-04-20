(:
Copyright 2015 MarkLogic Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
:)
xquery version "1.0-ml";

module namespace c = "http://marklogic.com/telemetry/config";

import module namespace def = "http://marklogic.com/roxy/defaults" at "/roxy/config/defaults.xqy";

declare namespace telemetry = "http://marklogic.com/telemetry";

declare namespace edl = "http://marklogic.com/edl";


(:***** TELEMETRY CONFIG VARIABLES *****:)
(: Put your app username/password here. For more complex cases, change the authentication mechanism. :)
declare variable $HTTP-OPTIONS :=
	<options xmlns="xdmp:http">
		<authentication>
			<username>admin</username>
			<password>password</password>
		</authentication>
	</options>
;
declare variable $PORT := 8070;
(: How long to keep telemtry data in the DB before removal :)
declare variable $AGE-LIMIT := xs:dayTimeDuration("P365D");
(: Path to store telemetry data that has been removed from the DB. If empty, data is deleted permanently. :)
declare variable $CLEANUP-LOCATION := "/tmp/";
(: The collection that your documents are stored in. :)
declare variable $DOCUMENT-COLLECTION := "documents";
(: Reference to QName where document date is stored. :)
declare variable $DOCUMENT-TIME-REF := cts:element-reference(xs:QName("edl:ingest-datetime"));

(: Don't change the variables below unless you know what you're doing. Changing these will require corresponding changes
   in telemetry-lib.xqy and controllers/telemetry.xqy.
:)
declare variable $TELEMETRY-COLLECTION := "telemetry";
declare variable $TELEMETRY-URI-PREFIX := "/telemetry/";
declare variable $TELEMETRY-ELEMENT-QNAME := xs:QName("telemetry:data");
declare variable $TELEMETRY-FRAGMENT-QNAME := xs:QName("telemetry:metrics");
declare variable $TELEMETRY-COLLATION := "collation=http://marklogic.com/collation/codepoint";
declare variable $TELEMETRY-TIME-REF := cts:element-attribute-reference($TELEMETRY-ELEMENT-QNAME, xs:QName("time"));
declare variable $TELEMETRY-DURATION-REF := cts:element-attribute-reference($TELEMETRY-ELEMENT-QNAME, xs:QName("duration"));
declare variable $TELEMETRY-USER-REF := cts:element-attribute-reference($TELEMETRY-ELEMENT-QNAME, xs:QName("user"), $TELEMETRY-COLLATION);
declare variable $TELEMETRY-ACTION-REF := cts:element-attribute-reference($TELEMETRY-FRAGMENT-QNAME, xs:QName("action"), $TELEMETRY-COLLATION);
declare variable $TELEMETRY-ID-REF := cts:element-attribute-reference($TELEMETRY-ELEMENT-QNAME, xs:QName("id"));