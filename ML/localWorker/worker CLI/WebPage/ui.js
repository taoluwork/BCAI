var baseurl = "http://localhost:3000";
var address = "0x40657BF5292750477fd7BC048078c7D39055E6a9";

function test() {
    alert("Hello");
    $.get( "https://www.google.com", function( data ) {
      $( ".result" ).html( data );
      alert( "Load was performed." );
    });
}

function showPools() {
  $.ajaxSetup({async: false});  
  $.ajax({     
      type: "GET",
      url: baseurl + '/pools',
      success: function (result) {
          console.log(result);
      }
  });
}

function showHistory() {
  var data = {
    Account: address
  };
  $.ajaxSetup({async: false});  
  $.ajax({     
      type: "POST",
      url: baseurl + '/history',
      headers: {
        'Content-Type':'application/json'
      },
      data: JSON.stringify(data), //this is the sent json data
      success: function (result) {
          console.log(result);
      }
  });
}

function Accounts() {
  $.ajaxSetup({async: false});  
  $.ajax({     
      type: "GET",
      url: baseurl + '/accounts',
      success: function (result) {
          console.log(result);
      }
  });
}

function startProviding(time, accuracy, cost) {
  var data = {
    time: time,
    accuracy: accuracy,
    cost: cost,
    Account: address
  };
  $.ajaxSetup({async: false});  
  $.ajax({     
      type: "POST",
      url: baseurl + '/startProviding',
      headers: {
        'Content-Type':'application/json'
      },
      data: JSON.stringify(data), //this is the sent json data
      success: function (result) {
          console.log(result);
      }
  });
}

function updateProvider(time, accuracy, cost) {
  var data = {
    time: time,
    accuracy: accuracy,
    cost: cost
  };
  $.ajaxSetup({async: false});  
  $.ajax({     
      type: "POST",
      url: baseurl + '/updateProvider',
      headers: {
        'Content-Type':'application/json'
      },
      data: JSON.stringify(data), //this is the sent json data
      success: function (result) {
          console.log(result);
      }
  });
}

function startTask(time, accuracy, cost) {
  var data = {
    time: time,
    accuracy: accuracy,
    cost: cost,
    Account: address
  };
  $.ajaxSetup({async: false});  
  $.ajax({     
      type: "POST",
      url: baseurl + '/startTask',
      headers: {
        'Content-Type':'application/json'
      },
      data: JSON.stringify(data), //this is the sent json data
      success: function (result) {
          console.log(result);
      }
  });
}

function updateTask(time, accuracy, cost) {
  var data = {
    time: time,
    accuracy: accuracy,
    cost: cost
  };
  $.ajaxSetup({async: false});  
  $.ajax({     
      type: "POST",
      url: baseurl + '/updateTask',
      headers: {
        'Content-Type':'application/json'
      },
      data: JSON.stringify(data), //this is the sent json data
      success: function (result) {
          console.log(result);
      }
  });
}

// function ShowPools() {
//   var asdf = $("#testbutton").length;
//   $.ajaxSetup({async: false});  
//   $.ajax({     
//       type: "GET",
//       url: baseurl + '/pools',
//       success: function (result) {
//           alert("Hello");
//           console.log(result);

//           $("#ActiveProviderPool").empty;
//           var $Active = $('<tr>').append($('<th>').text("Active Provider Pool: " + result.ActiveProviders));
//           $("#ActiveProviderPool").append($Active);
//           $.each(result.ActiveProviderAddresses, function(i, item) {
//             var $tr = $('<tr>').append(  $('<td>').text(item.Address)); 
//             $("#ActiveProviderPool").append($tr);
//           });

//           $("#PendingPool").empty;
//           var $Pending = $('<tr>').append($('<th>').text("Pending Pool: " + result.Pending));
//           $("#PendingPool").append($Pending);
//           $.each(result.PendingAddresses, function(i, item) {
//             var $tr = $('<tr>').append(  $('<td>').text(item.Address)); 
//             $("#PendingPool").append($tr);
//           });

//           $("#ProvidingPool").empty;
//           var $Providing = $('<tr>').append($('<th>').text("Providing Pool: " + result.Providing));
//           $("#ProvidingPool").append($Providing);
//           $.each(result.ProvidingAddresses, function(i, item) {
//             var $tr = $('<tr>').append(  $('<td>').text(item.Address)); 
//             $("#ProvidingPool").append($tr);
//           });

//           $("#ValidatingPool").empty;
//           var $Validating = $('<tr>').append($('<th>').text("Validating Pool: " + result.Validating));
//           $("#ValidatingPool").append($Validating);
//           $.each(result.ValidatingAddresses, function(i, item) {
//             var $tr = $('<tr>').append(  $('<td>').text(item.Address)); 
//             $("#ValidatingPool").append($tr);
//           });
//       }
//   });
// }