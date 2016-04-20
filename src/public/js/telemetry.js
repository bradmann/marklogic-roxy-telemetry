$(document).ready(function() {
	var monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var actionSummaryView = "";
	var docDateView = "";
	var uniqueDetailView = "";
	var actionTimeseriesView = "";
	var path_prefix = "../telemetry/";

	var uniqueUsersChartTitle = "Unique Users";
	var docDateChartTitle = "Document Dates";
	var actionSummaryChartTitle = "Request Summary";
	var actionCountChartTitle = "Request Counts";
	var actionDurationChartTitle = "Request Durations";
	var actionTimeseriesChartTitle = "Request Timeseries";

	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		if ($(e.target).text() == "User Metrics") {
			uniqueDetailChart.setSize($('#unique_users_detail_chart').width(), 400, false);
			docDateChart.setSize($('#document_ingest_chart').width(), 400, false);
			updateCharts('user');
		}

		if ($(e.target).text() == "Request Metrics") {
			actionSummaryChart.setSize($('#action_summary_chart').width(), 400, false);
			actionChart.setSize($('#action_chart').width(), 700, false);
			actionTimeChart.setSize($('#action_time_chart').width(), 700, false);
			actionTimeseriesChart.setSize($('#action_time_chart').width(), 700, false);
			updateCharts('action');
		}
	});

	$('#timeframe_select').on('change', function(evt, ui) {
		var timeframe = $(this).val();
		$.cookie('requestcount_period_value', timeframe, { expires: 365, path: '/' });
		updateDrillableChart(null, actionSummaryChart);
	});

	$('#topusers_duration_select').on('change', function(evt, ui) {
		var duration = $(this).val();
		$.cookie('topusers_duration_value', duration, { expires: 365, path: '/' });
		updateTopUsersChart(duration);
	});

	$('#action_duration_select').on('change', function(evt, ui) {
		var duration = $(this).val();
		$.cookie('action_duration_value', duration, { expires: 365, path: '/' });
		updateActionChart(duration);
	});

	$('#action_time_duration_select').on('change', function(evt, ui) {
		var duration = $(this).val();
		$.cookie('action_time_duration_value', duration, { expires: 365, path: '/' });
		updateActionTimeChart(duration);
	});

	$('#action_select').on('change', function(evt, ui) {
		var action = $(this).val();
		$.cookie('action_value', action, { expires: 365, path: '/' });
		updateDrillableChart(null, actionTimeseriesChart);
	});

	var actionSummaryChart = new Highcharts.Chart({
		chart: {
			type: 'column',
			renderTo: 'action_summary_chart',
			zoomType: 'x',
			events: {
				drilldown: drilldown,
				drillup: drillup
			}
		},
		title: {
			text: actionSummaryChartTitle
		},
		xAxis: {
			type: 'category',
			labels: {
				rotation: 45,
				formatter: function() {
					return this.value.split('T')[0];
				}
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Actions'
			},
			allowDecimals: false
		},
		legend: {
			enabled: false
		},
		series: [],
		drilldown: {
			series: []
		},
		url: path_prefix + 'getTelemetryCounts.json?view=',
		view: '',
		titleText: actionSummaryChartTitle
	});

	var docDateChart = new Highcharts.Chart({
		chart: {
			type: 'column',
			renderTo: 'document_ingest_chart',
			zoomType: 'x',
			events: {
				drilldown: drilldown,
				drillup: drillup
			}
		},
		title: {
			text: docDateChartTitle
		},
		xAxis: {
			type: 'category',
			labels: {
				rotation: 45,
				formatter: function() {
					return this.value.split('T')[0];
				}
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Documents'
			},
			allowDecimals: false
		},
		legend: {
			enabled: false
		},
		series: [],
		drilldown: {
			series: []
		},
		url: path_prefix + 'getIngestCounts.json?view=',
		view: '',
		titleText: docDateChartTitle
	});

	var actionChart = new Highcharts.Chart({
		chart: {
			type: 'column',
			renderTo: 'action_chart',
			zoomType: 'x'
		},
		title: {
			text: actionCountChartTitle
		},
		xAxis: {
			type: 'category',
			labels: {
				rotation: 45,
				formatter: function() {
					return this.value.split('/')[3];
				}
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Count'
			},
			allowDecimals: false
		},
		legend: {
			enabled: false
		},
		series: []
	});

	var uniqueDetailChart = new Highcharts.Chart({
		chart: {
			type: 'column',
			renderTo: 'unique_users_detail_chart',
			zoomType: 'x',
			events: {
				drilldown: drilldown,
				drillup: drillup
			}
		},
		title: {
			text: uniqueUsersChartTitle
		},
		xAxis: {
			type: 'category',
			labels: {
				rotation: 45,
				formatter: function() {
					return this.value.split('T')[0];
				}
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Users'
			},
			allowDecimals: false
		},
		legend: {
			enabled: false
		},
		series: [],
		drilldown: {
			series: []
		},
		url: path_prefix + 'getUserCounts.json?view=',
		view: '',
		titleText: uniqueUsersChartTitle
	});

	var actionTimeChart = new Highcharts.Chart({
		chart: {
			type: 'boxplot',
			renderTo: 'action_time_chart',
			zoomType: 'x'
		},
		title: {
			text: actionDurationChartTitle
		},
		legend: {
			enabled: false
		},
		xAxis: {
			type: 'category',
			labels: {
				rotation: 45,
				formatter: function() {
					return this.value.split('/')[3];
				}
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Time (s)'
			}
		},
		series: []
    });

    var actionTimeseriesChart = new Highcharts.Chart({
		chart: {
			type: 'column',
			renderTo: 'action_timeseries_chart',
			zoomType: 'x',
			events: {
				drilldown: drilldown,
				drillup: drillup
			}
		},
		title: {
			text: actionTimeseriesChartTitle
		},
		xAxis: {
			type: 'category',
			labels: {
				rotation: 45,
				formatter: function() {
					return this.value.split('T')[0];
				}
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Requests'
			},
			allowDecimals: false
		},
		legend: {
			enabled: false
		},
		series: [],
		drilldown: {
			series: []
		},
		url: function() {
			return path_prefix + 'getTelemetryCounts.json?' +
			'view=' + this.options.view +
			'&action=' + $('#action_select').val();
		},
		view: '',
		titleText: actionTimeseriesChartTitle
	});

	function updateTopUsersChart(duration) {
		$.ajax({
			url: '../telemetry/getMostActiveUsers.json?duration=' + duration,
			type: 'get',
			success: function (data) {
				$('#topusers_panel table tbody').empty();
				var keys = [];
				for(var k in data) keys.push(k);
				keys.sort(function(a,b) {
					a = parseInt(a);
					b = parseInt(b);
					if (a > b) {
						return -1;
					}
					if (a < b) {
						return 1;
					}
					return 0;
				});

				for (var i=0; i<keys.length; i++) {
					var user = data[keys[i]];
					user = (user instanceof Array) ? user.join('<br/>') : user;
					$('#topusers_panel table tbody').append('<tr><td>' + (i + 1) + '</td><td>' + user + '</td><td>' + keys[i] + '</td></tr>');
				}
			}
		});
	}

	function monthSort(a, b) {
		a = a['name'];
		b = b['name'];
		var aYear = a.split(' ')[0];
		var aMonth = $.inArray(a.split(' ')[1], monthsArray);
		var bYear = b.split(' ')[0];
		var bMonth = $.inArray(b.split(' ')[1], monthsArray);
		if (aYear > bYear) {
			return 1;
		} else if (aYear < bYear) {
			return -1;
		}

		if (aMonth > bMonth) {
			return 1;
		}
		if (aMonth < bMonth) {
			return -1;
		}
		return 0;
	}

	function itemSort(a, b) {
		if (a['name'] > b['name']) {
			return 1;
		}
		if (a['name'] < b['name']) {
			return -1;
		}
		return 0;
	}

	function drilldown(e) {
		if (!e.seriesOptions) {
			var chart = e.target;
			if (chart.options.view == '') {
				chart.options.view = e.point.name.split(' ')[0] + '/' + e.point.name.split(' ')[1];
			} else if (chart.options.view.split('/').length == 2) {
				chart.options.view = chart.options.view + '/' + e.point.name;
			}
			updateDrillableChart(e, e.target);
		}
	}

	function drillup(e) {
		var chart = e.target;
		var tokens = chart.options.view.split('/');
		chart.options.view = (tokens.length == 2) ? '' : tokens.slice(0, -1).join('/');
		var title = (chart.options.view == '') ? '' : ' ' + chart.options.view.split('/').join(' ');
		chart.setTitle({text: chart.options.titleText + title});
	}

	function updateDrillableChart(evt, chart) {
		chart.showLoading('Loading');
		var url = $.isFunction(chart.options.url) ? chart.options.url.bind(chart)() : chart.options.url + chart.options.view;
		$.ajax({
			url: url,
			type: 'get',
			success: function (data) {
				chart.hideLoading();
				if (!evt) {
					while (chart.series.length > 0) {
						chart.series[0].remove(true);
					}
				}
				var drilldown = (chart.options.view.split('/').length == 3) ? false : true;

				var seriesdata = [];
				for (var key in data) {
					seriesdata.push({name: key, y: data[key], drilldown: drilldown});
				}
				seriesdata.sort((chart.options.view == '') ? monthSort : itemSort);

				var detailTitle = chart.options.titleText + ' ' + chart.options.view.split('/').join(' ');
				if (chart.options.view.split('/').length > 2) {
					chart.xAxis[0].update({labels: {step: 1, formatter: function() {return this.value;}}});
					chart.setTitle({'text': detailTitle});
				} else if (chart.options.view.split('/').length == 2) {
					chart.xAxis[0].update({labels: {step: 1, formatter: function() {return this.value;}}});
					chart.setTitle({'text': detailTitle});
				} else if (chart.options.view == '') {
					chart.xAxis[0].update({
						labels: {
							step: 1, 
							formatter: function() {
								return this.value.split(' ')[1] + ' ' + this.value.split(' ')[0];
							}
						}
					});
					chart.setTitle({'text': chart.options.titleText});
				}
				if (!evt) {
					chart.addSeries({data: seriesdata, color: '#2f7ed8', name: chart.options.titleText});
				} else {
					chart.addSeriesAsDrilldown(evt.point, {data: seriesdata, color: '#2f7ed8', name: detailTitle});
				}
			}
		});
	}

	function updateActionChart(duration) {
		actionChart.showLoading('Loading');
		$.ajax({
			url: '../telemetry/getActionMetrics.json?duration=' + duration,
			type: 'get',
			success: function (data) {
				actionChart.hideLoading();
				while (actionChart.series.length > 0) {
					actionChart.series[0].remove(true);
				}
				var seriesdata = [];
				for (var key in data) {
					seriesdata.push({name: key, y: data[key]});
				}
				seriesdata.sort(function(a, b) {
					if (a['y'] > b['y']) {
						return -1;
					}
					if (a['y'] < b['y']) {
						return 1;
					}
					return 0;
				});
				
				actionChart.addSeries({data: seriesdata, color: '#2f7ed8', name: actionCountChartTitle});
			}
		});
	}

	function updateActionTimeChart(duration) {
		actionTimeChart.showLoading('Loading');
		$.ajax({
			url: '../telemetry/getActionTimeMetrics.json?duration=' + duration,
			type: 'get',
			success: function (data) {
				actionTimeChart.hideLoading();
				while (actionTimeChart.series.length > 0) {
					actionTimeChart.series[0].remove(true);
				}
				var seriesdata = [];
				for (var key in data) {
					var vals = data[key];
					if (vals.length == 5) {
						seriesdata.push([key, vals[0], vals[1], vals[2], vals[3], vals[4]]);
					}
				}
				seriesdata.sort(function(a, b) {
					if (a[5] > b[5]) {
						return -1;
					}
					if (a[5] < b[5]) {
						return 1;
					}
					return 0;
				});
				
				actionTimeChart.addSeries({data: seriesdata, color: '#2f7ed8', name: actionDurationChartTitle});
			}
		});
	}

	function updateCharts(charts) {
		if (charts == 'user' || charts == null) {
			var topusersDuration = $.cookie('topusers_duration_value');
			topusersDuration = topusersDuration ? topusersDuration : '1';
			
			$('#topusers_duration_select').val(topusersDuration);

			updateDrillableChart(null, uniqueDetailChart);
			updateDrillableChart(null, docDateChart);
			updateTopUsersChart(topusersDuration);
		}

		if (charts == 'action' || charts == null) {
			var duration = $.cookie('action_duration_value');
			duration = duration ? duration : '1';
			var timeduration = $.cookie('action_time_duration_value');
			timeduration = timeduration ? timeduration : '1';
			var action = $.cookie('action_value');
			action = action ? action : $('#action_select').val();
			$('#duration_select').val(duration);
			$('#action_select').val(action);
			updateDrillableChart(null, actionSummaryChart);
			updateActionChart(duration);
			updateActionTimeChart(timeduration);
			updateDrillableChart(null, actionTimeseriesChart);
		}
	}

	$('a[data-toggle="tab"]:first').trigger("shown.bs.tab");
});