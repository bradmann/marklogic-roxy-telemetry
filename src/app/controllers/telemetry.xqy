xquery version "1.0-ml";

module namespace c = "http://marklogic.com/roxy/controller/telemetry";

import module namespace ch = "http://marklogic.com/roxy/controller-helper" at "/roxy/lib/controller-helper.xqy";
import module namespace req = "http://marklogic.com/roxy/request" at "/roxy/lib/request.xqy";
import module namespace tl = "http://marklogic.com/telemetry-lib" at "/app/models/telemetry-lib.xqy";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";
import module namespace tc = "http://marklogic.com/telemetry/config" at "/app/config/telemetry-config.xqy";

declare function c:main() as item()* {
	ch:set-value("action-list", cts:values($tc:TELEMETRY-ACTION-REF, (), (), cts:collection-query($tc:TELEMETRY-COLLECTION))),
	ch:use-layout(())
};

declare function c:collect() as item()* {
	let $_ := xdmp:log('collecting telemetry data')
	let $_ := tl:collect()
	return (
	  	ch:use-view(()),
		ch:use-layout(()),
		'{"success": true}'
	)
};

declare function c:cleanup() as item()* {
	let $_ := tl:cleanup()
	return (
		ch:use-view(()),
		ch:use-layout(()),
		'{"success": true}'
	)
};

declare function c:getMostActiveUsers() as item()* {
	let $duration := req:get('duration', 1, 'type=xs:integer')
	let $duration := $duration - 1
	let $day-start := fn:adjust-dateTime-to-timezone(xs:dateTime(fn:substring-before(fn:string(fn:current-dateTime() - xs:dayTimeDuration("P" || $duration || "D")), "T") || "T00:00:00"), fn:implicit-timezone())
	let $day-end := fn:adjust-dateTime-to-timezone(xs:dateTime(fn:substring-before(fn:string(fn:current-dateTime() + xs:dayTimeDuration("P1D")), "T") || "T00:00:00"), fn:implicit-timezone())
	let $q := cts:and-query((
		cts:collection-query($tc:TELEMETRY-COLLECTION),
		tl:range-query($tc:TELEMETRY-TIME-REF, '>=', $day-start),
		tl:range-query($tc:TELEMETRY-TIME-REF, '<', $day-end)
	))
	let $values := cts:values($tc:TELEMETRY-USER-REF, (), ("item-frequency", "descending", "frequency-order"), $q)
	let $m := map:map()
	let $buildmap :=
		for $value in $values[1 to 10]
		let $count := fn:string(cts:frequency($value))
		return if (map:contains($m, $count)) then map:put($m, $count, (map:get($m, $count), $value)) else map:put($m, $count, $value)
	return xdmp:to-json($m)
};


declare function c:getActionMetrics() as item()*{
	let $now := fn:current-dateTime()
	let $timezone := if (fn:contains(fn:string($now), "Z")) then "Z" else "-" || fn:tokenize(fn:string($now), '-')[fn:last()]
	let $day-end := xs:dateTime(fn:tokenize(fn:string($now + xs:dayTimeDuration("P1D")), 'T')[1] || 'T00:00:00.000000' || $timezone)
	let $duration := req:get('duration', '1', 'type=xs:string')
	let $start := $day-end - xs:dayTimeDuration('P' || $duration || 'D')
	let $q := cts:and-query((
			cts:collection-query($tc:TELEMETRY-COLLECTION),
			tl:range-query($tc:TELEMETRY-TIME-REF, '>=', $start),
			tl:range-query($tc:TELEMETRY-TIME-REF, '<', $day-end)
		))
	let $services := cts:values($tc:TELEMETRY-ACTION-REF, (), (), $q)
	let $m := map:map()
	let $buildmap :=
		for $service in $services
		let $service-q := cts:and-query((tl:range-query($tc:TELEMETRY-ACTION-REF, "=", $service, $tc:TELEMETRY-COLLATION), $q))
		return map:put($m, $service, cts:count-aggregate($tc:TELEMETRY-ID-REF, ("item-frequency"), $service-q))
	return xdmp:to-json($m)
};

declare function c:getActionTimeMetrics() as item()* {
	let $now := fn:current-dateTime()
	let $timezone := if (fn:contains(fn:string($now), "Z")) then "Z" else "-" || fn:tokenize(fn:string($now), '-')[fn:last()]
	let $day-end := xs:dateTime(fn:tokenize(fn:string($now + xs:dayTimeDuration("P1D")), 'T')[1] || 'T00:00:00.000000' || $timezone)
	let $duration := req:get('duration', '1', 'type=xs:string')
	let $start := $day-end - xs:dayTimeDuration('P' || $duration || 'D')
	let $q := cts:and-query((
			cts:collection-query($tc:TELEMETRY-COLLECTION),
			tl:range-query($tc:TELEMETRY-TIME-REF, '>=', $start),
			tl:range-query($tc:TELEMETRY-TIME-REF, '<', $day-end)
		))
	let $services := cts:values($tc:TELEMETRY-ACTION-REF, (), (), $q)
	let $m := map:map()
	let $buildmap :=
		for $service in $services
		let $service-q := cts:and-query((tl:range-query($tc:TELEMETRY-ACTION-REF, "=", $service, $tc:TELEMETRY-COLLATION), $q))
		let $max := cts:max($tc:TELEMETRY-DURATION-REF, ("item-frequency"), $service-q)
		let $min := cts:min($tc:TELEMETRY-DURATION-REF, ("item-frequency"), $service-q)
		let $median := cts:median(cts:values($tc:TELEMETRY-DURATION-REF, (), ("item-frequency"), $service-q))
		let $lq := cts:median(cts:values($tc:TELEMETRY-DURATION-REF, (), ("item-frequency"), $service-q)[. lt $median])
		let $uq := cts:median(cts:values($tc:TELEMETRY-DURATION-REF, (), ("item-frequency"), $service-q)[. gt $median])
		return map:put($m, $service, (xs:double($min), $lq, $median, $uq, xs:double($max)))
	return xdmp:to-json($m)
};

declare function c:getUserCounts() as item()* {
	c:countData(cts:collection-query($tc:TELEMETRY-COLLECTION), $tc:TELEMETRY-TIME-REF, $tc:TELEMETRY-USER-REF, "count")
};

declare function c:getTelemetryCounts() as item()* {
	let $action := req:get("action", (), "type=xs:string")
	let $q := cts:and-query((
		cts:collection-query($tc:TELEMETRY-COLLECTION),
		if (fn:exists($action)) then
			cts:element-attribute-range-query($tc:TELEMETRY-FRAGMENT-QNAME, xs:QName("action"), "=", $action, $tc:TELEMETRY-COLLATION)
		else
			()
	))
	return c:countData($q, $tc:TELEMETRY-TIME-REF, $tc:TELEMETRY-ID-REF, "aggregate")
};

declare function c:getIngestCounts() as item()* {
	c:countData(cts:collection-query($tc:DOCUMENT-COLLECTION), $tc:DOCUMENT-TIME-REF, (), "estimate")
};

declare private function c:countData($q as cts:query, $date-reference as cts:reference, $reference as cts:reference*, $operation as xs:string) as item()* {
	let $date-string := req:get('view', '', 'type=xs:string')
	let $scope :=
		if (fn:empty($date-string) or $date-string = '') then 'monthly'
		else if (fn:count(fn:tokenize($date-string, "/")) = 2) then 'daily'
		else 'hourly'
	let $now := fn:current-dateTime()
	let $timezone := if (fn:contains(fn:string($now), "Z")) then "Z" else "-" || fn:tokenize(fn:string($now), '-')[fn:last()]
	let $months-sequence := ("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")

	let $data-map := map:map()
	let $_ :=
		if ($scope = 'monthly') then
			let $month-start := fn:adjust-dateTime-to-timezone(xs:dateTime(fn:string(functx:first-day-of-month(fn:current-dateTime())) || 'T00:00:00'), fn:implicit-timezone())
			let $month-end := fn:adjust-dateTime-to-timezone(xs:dateTime(fn:string(functx:last-day-of-month(fn:current-dateTime()) + xs:dayTimeDuration('P1D')) || 'T00:00:00'), fn:implicit-timezone())
			let $end := $month-end
			let $start := $month-start
			for $i in (1 to 24)
			let $query := cts:and-query((
				$q,
				tl:range-query($date-reference, '>=', $start),
				tl:range-query($date-reference, '<', $end)
			))
			let $prev-month := xs:date(functx:previous-day($start))
			let $_ := map:put(
				$data-map,
				fn:year-from-dateTime($start) || ' ' || functx:month-name-en($start),
				if ($operation = "aggregate") then
					cts:count-aggregate($reference, ("item-frequency"), $query)
				else if ($operation = "count") then
					fn:count(cts:values($reference, (), (), $query))
				else
					xdmp:estimate(cts:search(/, $query))
			)
			return (xdmp:set($start, fn:adjust-dateTime-to-timezone(xs:dateTime(fn:string(functx:first-day-of-month($prev-month)) || 'T00:00:00'), fn:implicit-timezone())), xdmp:set($end, fn:adjust-dateTime-to-timezone(xs:dateTime(fn:string(functx:last-day-of-month($prev-month) + xs:dayTimeDuration('P1D')) || 'T00:00:00'), fn:implicit-timezone())))
		else if ($scope = 'daily') then
			let $year := fn:tokenize($date-string, "/")[1]
			let $month := fn:index-of($months-sequence, fn:tokenize($date-string, "/")[2])
			let $day-start := fn:adjust-dateTime-to-timezone(xs:dateTime($year || "-" || functx:pad-integer-to-length($month, 2) || "-01T00:00:00"), fn:implicit-timezone())
			let $day-end := fn:adjust-dateTime-to-timezone(xs:dateTime($year || "-" || functx:pad-integer-to-length($month, 2) || "-02T00:00:00"), fn:implicit-timezone())
			let $end := $day-end
			let $start := $day-start
			for $i in (1 to functx:days-in-month($start))
			let $query := cts:and-query((
				$q,
				tl:range-query($date-reference, '>=', $start),
				tl:range-query($date-reference, '<', $end)
			))
			let $_ := map:put(
				$data-map,
				fn:substring(fn:substring-before(fn:string($start), 'T'), 9, 2),
				if ($operation = "aggregate") then
					cts:count-aggregate($reference, ("item-frequency"), $query)
				else if ($operation = "count") then
					fn:count(cts:values($reference, (), (), $query))
				else
					xdmp:estimate(cts:search(/, $query))
			)
			return (xdmp:set($start, $start + xs:dayTimeDuration('P1D')), xdmp:set($end, $end + xs:dayTimeDuration('P1D')))
		else
			let $year := fn:tokenize($date-string, "/")[1]
			let $month := fn:index-of($months-sequence, fn:tokenize($date-string, "/")[2])
			let $day := fn:tokenize($date-string, "/")[3]
			let $hour-start := xs:dateTime($year || "-" || functx:pad-integer-to-length($month, 2) || "-" || $day || "T00:00:00.000000" || $timezone)
			let $hour-end := xs:dateTime($year || "-" || functx:pad-integer-to-length($month, 2) || "-" || $day || "T01:00:00.000000" || $timezone)
			let $end := $hour-end
			let $start := $hour-start
			for $i in (1 to 24)
			let $query := cts:and-query((
				$q,
				tl:range-query($date-reference, '>=', $start),
				tl:range-query($date-reference, '<', $end)
			))
			let $_ := map:put(
				$data-map,
				fn:substring(fn:substring-after(fn:string($start), 'T'), 1, 5),
				if ($operation = "aggregate") then
					cts:count-aggregate($reference, ("item-frequency"), $query)
				else if ($operation = "count") then
					fn:count(cts:values($reference, (), (), $query))
				else
					xdmp:estimate(cts:search(/, $query))
			)
			return (xdmp:set($start, $start + xs:dayTimeDuration('PT1H')), xdmp:set($end, $end + xs:dayTimeDuration('PT1H')))
	return xdmp:to-json($data-map)
};
