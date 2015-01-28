xquery version "1.0-ml";

module namespace tl = "http://marklogic.com/telemetry-lib";

import module namespace tc = "http://marklogic.com/telemetry/config" at "/app/config/telemetry-config.xqy";

declare namespace telemetry = "http://marklogic.com/telemetry";

declare function tl:range-query($references as cts:reference*, $operator as xs:string, $value as xs:anyAtomicType*) {
	tl:range-query($references, $operator, $value, (), ())
};

declare function tl:range-query($references as cts:reference*, $operator as xs:string, $value as xs:anyAtomicType*, $options as xs:string*) {
	tl:range-query($references, $operator, $value, $options, ())
};

declare function tl:range-query($references as cts:reference*, $operator as xs:string, $value as xs:anyAtomicType*, $options as xs:string*, $weight as xs:double?) {
	cts:or-query((
		for $reference in $references
		let $ref := <x>{$reference}</x>/node()
		return
			typeswitch ($ref)
			case element(cts:element-attribute-reference) return
				let $element := fn:QName($ref/cts:parent-namespace-uri/fn:string(), $ref/cts:parent-localname/fn:string())
				let $attribute := fn:QName($ref/cts:namespace-uri/fn:string(), $ref/cts:localname/fn:string())
				return cts:element-attribute-range-query($element, $attribute, $operator, $value, $options, $weight)
			case element(cts:element-reference) return
				let $element := fn:QName($ref/cts:namespace-uri/fn:string(), $ref/cts:localname/fn:string())
				return cts:element-range-query($element, $operator, $value, $options, $weight)
			case element(cts:field-reference) return
				let $field := $ref/cts:field/fn:string()
				return cts:field-range-query($field, $operator, $value, $options, $weight)
			case element(cts:path-reference) return
				let $path := $ref/cts:path/fn:string()
				return cts:path-range-query($path, $operator, $value, $options, $weight)
			default return ()
	))
};

declare function tl:track($user as xs:string?, $action as xs:string) {
	tl:track($user, $action, fn:current-dateTime(), ())
};

declare function tl:track($user as xs:string?, $action as xs:string, $time as xs:dateTime, $elapsed-time as xs:dayTimeDuration?) {
	let $mmap := xdmp:get-server-field('telemetry-map', ())
	let $_ := if (fn:empty($mmap)) then xdmp:set-server-field('telemetry-map', map:map()) else ()
	let $mmap := xdmp:get-server-field('telemetry-map', ())
	let $submap := map:map()
	let $_ := map:put($submap, "user", $user)
	let $_ := map:put($submap, "action", $action)
	let $_ := map:put($submap, "time", $time)
	let $_ := map:put($submap, "duration", $elapsed-time div xs:dayTimeDuration("PT1S"))
	let $_ := map:put($submap, "id", fn:string(xdmp:request()))
	return map:put($mmap, fn:string(xdmp:request()), $submap)
};

declare function tl:collect() {
	let $_ := xdmp:log("Collecting telemetry data.")
	let $now := fn:current-dateTime()
	let $host := xdmp:host-name(xdmp:host())
	let $mmap := xdmp:get-server-field('telemetry-map', map:map())
	let $actionmap := map:map()
	let $build-actionmap :=
		for $key in map:keys($mmap)
		let $submap := map:get($mmap, $key)
		let $user := map:get($submap, "user")
		let $action := map:get($submap, "action")
		let $time := map:get($submap, "time")
		let $duration := map:get($submap, "duration")
		let $id := map:get($submap, "id")
		let $element :=
			element telemetry:data {
				if (fn:exists($user)) then attribute user {$user} else (),
				if (fn:exists($time)) then attribute time {$time} else (),
				if (fn:exists($duration)) then attribute duration {$duration} else (),
				if (fn:exists($id)) then attribute id {$id} else ()
			}
		return	map:put($actionmap, $action, ($element, map:get($actionmap, $action)))
	let $write-metrics-docs :=
		for $action in map:keys($actionmap)
		let $uri := $tc:TELEMETRY-URI-PREFIX || fn:string($now) || '/' || fn:encode-for-uri($action) || '/' || $host || '.xml'
		let $doc :=
			<metrics xmlns="http://marklogic.com/telemetry" action="{$action}" host="{$host}">
			{
				map:get($actionmap, $action)
			}
			</metrics>
		return xdmp:document-insert($uri, $doc, xdmp:default-permissions(), ($tc:TELEMETRY-COLLECTION))
	return xdmp:set-server-field('telemetry-map', map:map())
};

declare function tl:cleanup() {
	let $before := fn:current-dateTime() - $tc:AGE-LIMIT
	let $db-host-forests := for $forest in xdmp:host-forests(xdmp:host()) return if ($forest = xdmp:database-forests(xdmp:database(), fn:false())) then $forest else ()
	let $uris := xdmp:eval('
		xquery version "1.0-ml";
		import module namespace tc = "http://marklogic.com/telemetry/config" at "/app/config/telemetry-config.xqy";
		import module namespace tl = "http://marklogic.com/telemetry-lib" at "/app/models/telemetry-lib.xqy";
		declare namespace telemetry = "http://marklogic.com/telemetry";
		declare variable $before external;
		let $q := tl:range-query($tc:TELEMETRY-TIME-REF, "<", $before)
		return cts:uris((), (), $q)
		',
		(xs:QName("before"), $before),
		<options xmlns="xdmp:eval">
			<database>{$db-host-forests}</database>
		</options>
	)
	for $uri in $uris
	let $save :=
		if (fn:empty($tc:CLEANUP-LOCATION)) then
			()
		else
			let $filename := fn:substring-after($uri, $tc:TELEMETRY-URI-PREFIX)
			return xdmp:save($tc:CLEANUP-LOCATION || $filename, fn:doc($uri))
	return xdmp:document-delete($uri)
};

declare function tl:requests-per-period($periods) {
  for $period at $i in $periods
  let $prev-period := $periods[$i + 1]
  return if (fn:exists($prev-period)) then
    let $q := cts:and-query((
    	cts:collection-query($tc:TELEMETRY-COLLECTION),
      tl:range-query($tc:TELEMETRY-TIME-REF, '<', $period),
      tl:range-query($tc:TELEMETRY-TIME-REF, '>=', $prev-period)
    ))
    return cts:count-aggregate($tc:TELEMETRY-ID-REF, ("item-frequency"), $q)
  else ()
};