var selectDropdown;
var allVehicles;
var allTrips;
var totalFuelInLtrs = [];
var vehiclekms = [];

$(document).ready(() => {
    selectDropdown = $('#vehicleName');
    getVehicles()
    .done((data) => {
        allVehicles = data;
        addToDropdown(allVehicles);
    })
})

function getVehicles() {
    return $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/vehicle',
        dataType: 'json' 
    })
}

function addToDropdown(vehicles) {
    $.each(vehicles, (index) => {
        var option = $('<option/>', {
            value: vehicles[index]['number'],
            text: vehicles[index]['name']
        })
        selectDropdown.append(option);
    })
}

$(document).on('change', selectDropdown, function() {
    var selectedOption = selectDropdown.val();
    getAllTripsOfVehicle(selectedOption)
    .done((data) => {
        allTrips = data;
        $.each(allTrips, (index, trip) => {
            vehiclekms.push(trip.totalFuelPrice);
            totalFuelInLtrs.push(Number(trip.totalFuelPrice) / Number(trip.pricePerLtr));
        });
        drawChart();
        $('#vehicleInfo').removeClass('d-none');
        calcAvgTotalFuelPrice(vehiclekms);
        $('#overallAvg').html(calcOverallAvg().toFixed(2) + 'KM/Ltr');
    })
})

function getAllTripsOfVehicle(vehicle) {
    return $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/getTripsForVehicle/' + vehicle,
        dataType: 'json' 
    })
}

function calcAvgTotalFuelPrice(kms) {
    var avg = kms.reduce((sum, value) => sum + value, 0);
    avg = avg / kms.length;
    $('#avgTotalFuelPrice').html('Rs. ' + avg.toFixed(2));
}

function calcOverallAvg() {
    var totalFuel = totalFuelInLtrs.reduce((sum, value) => sum + value, 0);
    var totalKMs = vehiclekms.reduce((sum, value) => sum + value, 0);
    return totalKMs / totalFuel;
}

function drawChart() {
    google.charts.load('current', { packages: ['corechart', 'bar'] });
    google.charts.setOnLoadCallback(drawBarChart);
}

function drawBarChart() {
    var chartData = [];
    chartData.push(['Fuel Price', 'Trip']);
    $.each(allTrips, function (index, trip) {
        var tripDate = new Date(trip.date);
        var dateString = tripDate.getDate() + '/' + parseInt(tripDate.getMonth() + 1) + '/' + tripDate.getFullYear();
        chartData.push(
            [
                dateString,
                Number(trip.totalFuelPrice)
            ]
        );
    });
    var data = google.visualization.arrayToDataTable(chartData);
    var options = {
        title: 'Trip vs Fuel Price',
        hAxis: {
            title: 'Trip Date'
        },
        vAxis: {
            title: 'Fuel Price',
            minValue: 0
        }
    };
    var chart = new google.visualization.ColumnChart($('#chartContainer')[0]);
    chart.draw(data, options);
}