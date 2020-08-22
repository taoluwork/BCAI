

//the call back Hell issue:
//https://medium.com/codebuddies/getting-to-know-asynchronous-javascript-callbacks-promises-and-async-await-17e0673281ee

let resutl = await ipfs.files.add(this.state.buffer, (err, result) => {
    if (err) {
      console.log("IPFS Error!", err);
      this.addNotification("Error", "Your file could not be uploaded. Please choose a file and try again.", "warning");
      return null
    }
    else {
      console.log("ipfsHash returned", result[0].hash)
      this.addNotification("Upload Complete", "File was succesfully added to IPFS! URL/DataID: " + result[0].hash, "success")
      this.setState({ dataID: result[0].hash })
      
      //you can do something here with result
      
      return result[0].hash
    }
  }) 
//you cannot do anything here, because when file reach here, the result is not returned.

console.log(result)



//NOTE: this is a callback hell, the return result[0].hash cannot return the value to the external when console.log() it.
//Potential solution is to use promise API but not interchangable.
//This means that callback-based APIs cannot be used as Promises. 
//The main difference with callback-based APIs is it does not return a value, it just executes the callback with the result.
//In order to solve this issue, wrap the call-back API into a promise-base API see example below

//wrap it with promise
IPFSupload = async() => {
    return new Promise((resolve, reject) => {
      ipfs.files.add(this.state.buffer, (err, result) => {
        if (err) { reject(err) }    //if err, handle using reject function
        else { resolve(result) }    //if no err, handle using resolve
      })                            //NOTE: resolve and rej is provided where IPFSupload is called.
    })
  }

IPFSSubmit =  async (event) => {  //declare this as async and it will return a promise, even not explicitly
event.preventDefault();
console.log("submiting...")
this.addNotification("Uploading file...", "Awaiting response from IPFS", "info");
this.IPFSupload()   //pass and define the resolve and reject function here!
.then(result => {   //resolve
    console.log("ipfsHash returned", result[0].hash)
    this.addNotification("Upload Complete", "File was succesfully added to IPFS! URL/DataID: " + result[0].hash, "success")
    this.setState({ dataID: result[0].hash })
    return result[0].hash
})
.catch(err => {     //reject
    console.log("IPFS Error!", err);
    this.addNotification("Error", "Your file could not be uploaded. Please choose a file and try again.", "warning");
    return null
})
}