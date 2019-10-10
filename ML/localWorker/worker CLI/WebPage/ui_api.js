function test() {
    alert("Hello");
    $.get( "https://www.google.com", function( data ) {
      $( ".result" ).html( data );
      alert( "Load was performed." );
    });
}