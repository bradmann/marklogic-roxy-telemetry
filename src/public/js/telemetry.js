$(document).ready(function() {
	var monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var actionSummaryView = "";
	var docDateView = "";
	var uniqueDetailView = "";
	var actionTimeseriesView = "";

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
		updateActionSummaryChart(timeframe);
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
		updateActionTimeseriesChart();
	});

	var actionSummaryChart = new Highcharts.Chart({
		chart: {
			type: 'column',
			renderTo: 'action_summary_chart',
			zoomType: 'x',
			events: {
				drilldown: function(e) {
					if (!e.seriesOptions) {
						var chart = this;
						if (actionSummaryView == '') {
							actionSummaryView = e.point.name.split(' ')[0] + '/' + e.point.name.split(' ')[1];
						} else if (actionSummaryView.split('/').length == 2) {
							actionSummaryView = actionSummaryView + '/' + e.point.name;
						}
						updateActionSummaryChart(e);
					}
				},
				drillup: function(e) {
					var chart = this;
					var tokens = actionSummaryView.split('/');
					actionSummaryView = (tokens.length == 2) ? '' : tokens.slice(0, -1).join('/');
					var title = (actionSummaryView == '') ? '' : ' ' + actionSummaryView.split('/').join(' ');
					chart.setTitle({text: 'Actions' + title});
				}
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
		}
	});

	var docDateChart = new Highcharts.Chart({
		chart: {
			type: 'column',
			renderTo: 'document_ingest_chart',
			zoomType: 'x',
			events: {
				drilldown: function(e) {
					if (!e.seriesOptions) {
						var chart = this;
						if (docDateView == '') {
							docDateView = e.point.name.split(' ')[0] + '/' + e.point.name.split(' ')[1];
						} else if (docDateView.split('/').length == 2) {
							docDateView = docDateView + '/' + e.point.name;
						}
						updateDocumentIngestChart(e);
					}
				},
				drillup: function(e) {
					var chart = this;
					var tokens = docDateView.split('/');
					docDateView = (tokens.length == 2) ? '' : tokens.slice(0, -1).join('/');
					var title = (docDateView == '') ? '' : ' ' + docDateView.split('/').join(' ');
					chart.setTitle({text: 'Documents Ingested' + title});
				}
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
		}
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
				drilldown: function(e) {
					if (!e.seriesOptions) {
						var chart = this;
						if (uniqueDetailView == '') {
							uniqueDetailView = e.point.name.split(' ')[0] + '/' + e.point.name.split(' ')[1];
						} else if (uniqueDetailView.split('/').length == 2) {
							uniqueDetailView = uniqueDetailView + '/' + e.point.name;
						}
						updateUniqueUsersDetailChart(e);
					}
				},
				drillup: function(e) {
					var chart = this;
					var tokens = uniqueDetailView.split('/');
					uniqueDetailView = (tokens.length == 2) ? '' : tokens.slice(0, -1).join('/');
					var title = (uniqueDetailView == '') ? '' : ' ' + uniqueDetailView.split('/').join(' ');
					chart.setTitle({text: uniqueUsersChartTitle + title});
				}
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
		}
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
				drilldown: function(e) {
					if (!e.seriesOptions) {
						var chart = this;
						if (actionTimeseriesView == '') {
							actionTimeseriesView = e.point.name.split(' ')[0] + '/' + e.point.name.split(' ')[1];
						} else if (actionTimeseriesView.split('/').length == 2) {
							actionTimeseriesView = actionTimeseriesView + '/' + e.point.name;
						}
						updateActionTimeseriesChart(e);
					}
				},
				drillup: function(e) {
					var chart = this;
					var tokens = actionTimeseriesView.split('/');
					actionTimeseriesView = (tokens.length == 2) ? '' : tokens.slice(0, -1).join('/');
					var title = (actionTimeseriesView == '') ? '' : ' ' + actionTimeseriesView.split('/').join(' ');
					chart.setTitle({text: 'Request Timeseries' + title});
				}
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
		}
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

	function updateUniqueUsersDetailChart(evt) {
		uniqueDetailChart.showLoading('Loading');
		$.ajax({
			url: '../telemetry/getUserCounts.json?view=' + uniqueDetailView,
			type: 'get',
			success: function (data) {
				uniqueDetailChart.hideLoading();
				if (!evt) {
					while (uniqueDetailChart.series.length > 0) {
						uniqueDetailChart.series[0].remove(true);
					}
				}
				var drilldown = (uniqueDetailView.split('/').length == 3) ? false : true;

				var seriesdata = [];
				for (var key in data) {
					seriesdata.push({name: key, y: data[key], drilldown: drilldown});
				}
				seriesdata.sort((uniqueDetailView == '') ? monthSort : itemSort);

				var detailTitle = uniqueUsersChartTitle + ' ' + uniqueDetailView.split('/').join(' ');
				if (uniqueDetailView.split('/').length > 2) {
					uniqueDetailChart.xAxis[0].update({labels: {step: 1, formatter: function() {return this.value;}}});
					uniqueDetailChart.setTitle({'text': detailTitle});
				} else if (uniqueDetailView.split('/').length == 2) {
					uniqueDetailChart.xAxis[0].update({labels: {step: 1, formatter: function() {return this.value;}}});
					uniqueDetailChart.setTitle({'text': detailTitle});
				} else if (uniqueDetailView == '') {
					uniqueDetailChart.xAxis[0].update({
						labels: {
							step: 1, 
							formatter: function() {
								return this.value.split(' ')[1] + ' ' + this.value.split(' ')[0];
							}
						}
					});
					uniqueDetailChart.setTitle({'text': uniqueUsersChartTitle});
				}
				if (!evt) {
					uniqueDetailChart.addSeries({data: seriesdata, color: '#2f7ed8', name: uniqueUsersChartTitle});
				} else {
					uniqueDetailChart.addSeriesAsDrilldown(evt.point, {data: seriesdata, color: '#2f7ed8', name: detailTitle});
				}
			}
		});
	};

	function updateActionSummaryChart(evt) {
		actionSummaryChart.showLoading('Loading');
		$.ajax({
			url: '../telemetry/getTelemetryCounts.json?view=' + actionSummaryView,
			type: 'get',
			success: function (data) {
				actionSummaryChart.hideLoading();
				if (!evt) {
					while (actionSummaryChart.series.length > 0) {
						actionSummaryChart.series[0].remove(true);
					}
				}
				var drilldown = (actionSummaryView.split('/').length == 3) ? false : true;

				var seriesdata = [];
				for (var key in data) {
					seriesdata.push({name: key, y: data[key], drilldown: drilldown});
				}
				seriesdata.sort((actionSummaryView == '') ? monthSort : itemSort);

				var detailTitle = actionSummaryChartTitle + ' ' + actionSummaryView.split('/').join(' ');
				if (actionSummaryView.split('/').length > 2) {
					actionSummaryChart.xAxis[0].update({labels: {step: 1, formatter: function() {return this.value;}}});
					actionSummaryChart.setTitle({'text': detailTitle});
				} else if (actionSummaryView.split('/').length == 2) {
					actionSummaryChart.xAxis[0].update({labels: {step: 1, formatter: function() {return this.value;}}});
					actionSummaryChart.setTitle({'text': detailTitle});
				} else if (actionSummaryView == '') {
					actionSummaryChart.xAxis[0].update({
						labels: {
							step: 1, 
							formatter: function() {
								return this.value.split(' ')[1] + ' ' + this.value.split(' ')[0];
							}
						}
					});
					actionSummaryChart.setTitle({'text': actionSummaryChartTitle});
				}
				if (!evt) {
					actionSummaryChart.addSeries({data: seriesdata, color: '#2f7ed8', name: actionSummaryChartTitle});
				} else {
					actionSummaryChart.addSeriesAsDrilldown(evt.point, {data: seriesdata, color: '#2f7ed8', name: detailTitle});
				}
			}
		});
	};

	function updateDocumentIngestChart(evt) {
		docDateChart.showLoading('Loading');
		$.ajax({
			url: '../telemetry/getIngestCounts.json?view=' + docDateView,
			type: 'get',
			success: function (data) {
				docDateChart.hideLoading();
				if (!evt) {
					while (docDateChart.series.length > 0) {
						docDateChart.series[0].remove(true);
					}
				}
				var drilldown = (docDateView.split('/').length == 3) ? false : true;

				var seriesdata = [];
				for (var key in data) {
					seriesdata.push({name: key, y: data[key], drilldown: drilldown});
				}
				seriesdata.sort((docDateView == '') ? monthSort : itemSort);

				var detailTitle = docDateChartTitle + ' ' + docDateView.split('/').join(' ');
				if (docDateView.split('/').length > 2) {
					docDateChart.xAxis[0].update({labels: {step: 1, formatter: function() {return this.value;}}});
					docDateChart.setTitle({'text': detailTitle});
				} else if (docDateView.split('/').length == 2) {
					docDateChart.xAxis[0].update({labels: {step: 1, formatter: function() {return this.value;}}});
					docDateChart.setTitle({'text': detailTitle});
				} else if (docDateView == '') {
					docDateChart.xAxis[0].update({
						labels: {
							step: 1, 
							formatter: function() {
								return this.value.split(' ')[1] + ' ' + this.value.split(' ')[0];
							}
						}
					});
					docDateChart.setTitle({'text': docDateChartTitle});
				}
				if (!evt) {
					docDateChart.addSeries({data: seriesdata, color: '#2f7ed8', name: docDateChartTitle});
				} else {
					docDateChart.addSeriesAsDrilldown(evt.point, {data: seriesdata, color: '#2f7ed8', name: detailTitle});
				}
			}
		});
	};

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
	};

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
	};

	function updateActionTimeseriesChart(evt) {
		actionTimeseriesChart.showLoading('Loading');
		$.ajax({
			url: '../telemetry/getTelemetryCounts.json?view=' + actionTimeseriesView + '&action=' + $('#action_select').val(),
			type: 'get',
			success: function (data) {
				actionTimeseriesChart.hideLoading();
				if (!evt) {
					while (actionTimeseriesChart.series.length > 0) {
						actionTimeseriesChart.series[0].remove(true);
					}
				}
				var drilldown = (actionTimeseriesView.split('/').length == 3) ? false : true;

				var seriesdata = [];
				for (var key in data) {
					seriesdata.push({name: key, y: data[key], drilldown: drilldown});
				}
				seriesdata.sort((actionTimeseriesView == '') ? monthSort : itemSort);

				var detailTitle = actionTimeseriesChartTitle + ' ' + actionTimeseriesView.split('/').join(' ');
				if (actionTimeseriesView.split('/').length > 2) {
					actionTimeseriesChart.xAxis[0].update({labels: {step: 1, formatter: function() {return this.value;}}});
					actionTimeseriesChart.setTitle({'text': detailTitle});
				} else if (actionTimeseriesView.split('/').length == 2) {
					actionTimeseriesChart.xAxis[0].update({labels: {step: 1, formatter: function() {return this.value;}}});
					actionTimeseriesChart.setTitle({'text': detailTitle});
				} else if (actionTimeseriesView == '') {
					actionTimeseriesChart.xAxis[0].update({
						labels: {
							step: 1, 
							formatter: function() {
								return this.value.split(' ')[1] + ' ' + this.value.split(' ')[0];
							}
						}
					});
					actionTimeseriesChart.setTitle({'text': actionTimeseriesChartTitle});
				}
				if (!evt) {
					actionTimeseriesChart.addSeries({data: seriesdata, color: '#2f7ed8', name: actionTimeseriesChartTitle});
				} else {
					actionTimeseriesChart.addSeriesAsDrilldown(evt.point, {data: seriesdata, color: '#2f7ed8', name: detailTitle});
				}
			}
		});
	};

	function updateCharts(charts) {
		if (charts == 'user' || charts == null) {
			var topusersDuration = $.cookie('topusers_duration_value');
			topusersDuration = topusersDuration ? topusersDuration : '1';
			
			$('#topusers_duration_select').val(topusersDuration);

			updateUniqueUsersDetailChart();
			updateDocumentIngestChart();
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
			updateActionSummaryChart();
			updateActionChart(duration);
			updateActionTimeChart(timeduration);
			updateActionTimeseriesChart();
		}
	}

	$('a[data-toggle="tab"]:first').trigger("shown.bs.tab");
});