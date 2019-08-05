var allVehicles;
var firstTripKMs;
var allTrips;
var prevKMsReading;
var selectDropdown;

$(document).ready(() => {
    selectDropdown = $('#vehicleName');
    getVehicles()
    .done((vehicles) => {
        allVehicles = vehicles;
        addToDropdown(allVehicles);
    })
});

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
    firstTripKMs = $.grep(allVehicles, function(value, index) {
        return value.number === selectedOption;
    })[0].kms;
    
    getTripsForVehicle(selectedOption)
    .done((trips) => {
        allTrips = trips;
        if (allTrips.length !== 0) {
            prevKMsReading = allTrips[allTrips.length - 1].kms;
        } else {
            prevKMsReading = firstTripKMs;
        }
        $('#prevKMs').html(prevKMsReading);
        $('#currentKMs').attr('min', prevKMsReading);
        updateTable(allTrips);
    })
})

function getTripsForVehicle(vehicle) {
    return $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/getTripsForVehicle/' + vehicle,
        dataType: 'json'
    })
}

function updateTable(trips) {
    $('#tripsBody').html('');
    $.each(trips, function(index, trip) {
        var tripDate = new Date(trip.date);
        var kmsInTrip = 0;
        if (index === 0) {
            kmsInTrip = calcKMsInTrip(trips[index].kms, firstTripKMs);
        } else {
            kmsInTrip = calcKMsInTrip(trips[index].kms, trips[index - 1].kms)
        }
        addRow(index, tripDate, trip, kmsInTrip);
    })
}

function addRow(index, tripDate, trip, kmsInTrip) {
    var tripRow = `<tr>
        <td>${index}</td>
        <td>${tripDate.getDate() + '/' + (tripDate.getMonth() + 1) + '/' + tripDate.getFullYear()}</td>
        <td>${trip.kms}</td>
        <td>${kmsInTrip}</td>
        <td>${calcAverage(kmsInTrip, trip.totalFuelPrice, trip.pricePerLtr).toFixed(2)}</td>
        <td>${calcPricePerKM(trip.totalFuelPrice, kmsInTrip).toFixed(2)}</td>
        <td><button value=${trip._id} type="button" class="deleteBtn btn btn-primary">Delete</button></td>
    </tr>`;
    $('#tripsBody').append(tripRow);
}

$(document).on('click', '.deleteBtn', function() {
    var objectId = this.value;
    deleteVehicle(objectId)
    .done(response => {
        var indexOfVehicle;
        $.grep(allTrips, function(value, index) {
            if(value._id === response._id) {
                indexOfVehicle = index;
            }
        });
        allTrips.splice(indexOfVehicle, 1);
        updateTable(allTrips);
    });
})

function deleteVehicle(vehicleId) {
    return $.ajax({
        type: 'DELETE',
        url: 'http://localhost:3000/trip/' + vehicleId,
    })
}

function calcKMsInTrip(currentTripKMs, previousTripKMs) {
    return Number(currentTripKMs) - Number(previousTripKMs);
}

function calcAverage(currentTripKMs, totalFuelPrice, pricePerLtr) {
    return Number(currentTripKMs) / (Number(totalFuelPrice) / Number(pricePerLtr));
}

function calcPricePerKM(totalFuelPrice, kmsInTrip) {
    return Number(totalFuelPrice) / Number(kmsInTrip);
}

$(document).on('keyup','#currentKMs', function() {
    var currentKMsReading = $('#currentKMs').val();
    var totalKMsInTrip = Number(currentKMsReading) - prevKMsReading;
    $('#TotalKMs').html(totalKMsInTrip);    
})

$(document).on('keyup', '#totalFuelPrice', calcFuelPrice);
$(document).on('keyup', '#pricePerLtr', calcFuelPrice);

function calcFuelPrice() {
    var totalFuelPrice = Number($('#totalFuelPrice').val());
    var pricePerLtr = Number($('#pricePerLtr').val());

    if (pricePerLtr !== 0) {
        var totalFuelFilled = (totalFuelPrice / pricePerLtr).toFixed(2);
        $('#totalFuelFilled').html(totalFuelFilled);
    }
}

$(document).on('submit','#tripForm', function(event) {
    event.preventDefault();
    let formdata = {};
    var temp = $('#tripForm').serializeArray();
    $.each(temp, function(index, element) {
        formdata[element.name] =  element.value;
    });

    submitForm(formdata)
    .done((response) => {
        allTrips.push(response);
        updateTable(allTrips);
    })
})

function submitForm(formdata) {
    return $.ajax({
        type: 'POST',
        url:  'http://localhost:3000/trip',
        dataType: 'json',
        data: formdata
    })
}