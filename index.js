$(document).on('submit', '#vehicleRegister',function() {
    event.preventDefault();
    let vehicle = {};
    $.each($('#vehicleRegister').serializeArray(), function(index, element) {
     vehicle[element.name] = element.value;
    });
    
    register(vehicle)
    .done((response) => {
        console.log(response);
    })
})

function register(vehicle) {
    return $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/vehicle',
        dataType: 'json',
        data: vehicle
    })
}

