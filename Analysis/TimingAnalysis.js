var i;
var sum = 0;
var start = process.hrtime();
const fs = require('fs');

fs.open('./Timing.txt', 'w', function(err) {
    if(err) throw err;
})

console.log("Starting timing analysis of loop with 10000 iterations");

for(j = 0; j < 100; j++) {
    for(i = 0; i < 10000; i++){
        sum += 2;
    }
    sum = 0;
    saveTime();
    console.log("Value saved");
}

function saveTime(){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    fs.appendFile('./stats.txt', elapsed.toFixed(precision) + "\n", (err) => {
        if (err) throw err;
    });
    start = process.hrtime(); // reset the timer
}