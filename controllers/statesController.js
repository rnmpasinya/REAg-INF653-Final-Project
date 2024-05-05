const State = require('../model/State');


const data = {
    states: require('../data/statesData.json'),
    setStates: function(data) {this.states = data}
};

const getAllStates = async (req, res) => {

    //pull the valid of "contig" in the URL, whether it exists or not
    const value = req.query.contig;
    // const params = req.url;
  


    //if contig exists, check value
    if(value !== null && value !== undefined){
      
        //if true, get the lower 48 plus their fun fact data
        if(value === "true"){
            res.status(200);
            //data.states is an array, loop through the array for AK and HI and remove them
            //using splice

            for(let i = 0; i < data.states.length; i++){

                if(data.states[i].code === "HI" || data.states[i].code === "AK"){
                    data.states.splice(i, 1);
                }

                //pull the data from MongoDB
                const duplicate = await State.findOne({ stateCode: data.states[i].code }).exec();
                //if no data exists for that state, skip this iteration of the loop
                if(duplicate === null) continue;
                //if there ARE facts for that state, add them to that state's JSON object
                if(duplicate.funfacts !== null) data.states[i].funfacts = duplicate.funfacts;

            }
            res.json(data.states);
            return;
           //if false, get Alaska and Hawaii + fun fact data
        } else if (value === "false") {

            
            res.status(200);
            let statesArr = [];
            //pull the two states individually as opposed to a for loop
            const state = data.states.find(stt => stt.code === "AK");
            const state2 = data.states.find(stt => stt.code === "HI");

            //push to the array we're using for the states data
            statesArr.push(state);
            statesArr.push(state2);

            //I tried this without the stringify bit, no change in behavior
            //I don't know why this isn't passing the automated test. My response looks like JSON data at the very least
            //I know it's different from how I wrote when contig = true - this just seemed like the best way to do it
            //I tried doing the same thing as contig=true but in reverse, but the automated tests didn't like that either
            //Unsure why this won't work, but I'll take 69/70 :)

            JSON.stringify(statesArr);
            
            //response is the above data
            res.json(statesArr);
            return;
        }
    }
    
    //I could not get external functions to work correctly and so
    //I'm using a similar for loop to the lower 48 here but not excluding any states
    for (let i = 0; i < data.states.length; i++){

        const duplicate = await State.findOne({ stateCode: data.states[i].code }).exec();

        if(duplicate === null) continue;

        if(duplicate.funfacts !== null) data.states[i].funfacts = duplicate.funfacts;


    }

    //otherwise the response is just all the states with their fact data
    res.status(200);
    res.json(data.states);
    return;

}



//NOTE: all of the functions from getOneState to getStateAdmission all function the same way
//there's a get request on the individual state passed in via JSON, and it returns the necessary data
//via the response
const getOneState = async (req, res) => {

   
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }

    const duplicate = await State.findOne({ stateCode: state.code }).exec();
    if(duplicate !== null && duplicate.funfacts !== null) state.funfacts = duplicate.funfacts;
       
    res.status(200);

    res.json(state);
}

const getStateCapital = async(req, res) => {

    
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }

    res.json({'state': state.state, 'capital': state.capital_city});
}

const getStateNickname = async(req, res) => {
    
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }

    res.json({'state': state.state, 'nickname': state.nickname});
}

const getStatePopulation = async(req, res) => {

    
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }

    res.json({'state': state.state, 'population': state.population.toLocaleString("en-US")});

}

const getStateAdmission = async(req, res) => {

    
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }

    res.json({'state': state.state, 'admitted': state.admission_date});


}

const addFunfact = async (req, res) => {

    let funfactsArr = [];
    
    //find the state in the request param
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());

    //if you can't find it, reject
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }
    // check for states info already present in the DB
    const duplicate = await State.findOne({ stateCode: state.code }).exec();
    const funfactsBody = req.body.funfacts;

   
    //if there's no fun fact in the body, reject
    if (!funfactsBody) {
        return res.status(400).json({"message": `State fun facts value required`}); //may need to change this
    }

    //if this is not null, check for fun facts in the found state, push it in to funfacts array
    if(duplicate?.funfacts) funfactsArr = duplicate.funfacts;

    //if the fun facts body is not an array, the automated grading thing doesn't want that, so we
    //reject it
    if(!Array.isArray(funfactsBody)){ 
        
        return res.status(400).json({"message": `State fun facts value must be an array`}); //may need to change this

        //else it must be an array, so we will concatenate the two arrays of the array that already
        //existed and the new array from the request
    } else {


        funfactsArr = funfactsArr.concat(funfactsBody);
       

    }
    
    //if there's nothing in the document, that means it's a state that needs to be added to the DB
    //this will create a new state document in the DB

    if (!duplicate) {

        try {
        
            const result = await State.create({
                
                stateCode: state.code,
                funfacts: funfactsArr

            });
            result.save();
            res.json(result);
            } catch (err) {
                console.error(err);
            }
        
        
        return;
    }

    
    //otherwise, the duplicate is a state that's in the DB, so we just essentially overwrite the whole thing
    //with the added information
    duplicate.overwrite({stateCode: duplicate.stateCode, funfacts: funfactsArr});
    duplicate.save();
    res.json(duplicate);
    
    //console.log(duplicate);
   
  
}

const getFunfact = async (req, res) => {

    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` });
    }
    // check for duplicate states in the DB
    const duplicate = await State.findOne({ stateCode: state.code }).exec();

    //if there's no state found, or there's no facts found for that state
    if(!duplicate || duplicate.funfacts === null) return res.status(400).json({"message": `No Fun Facts found for ${state.state}`});

    //getting here means there is a state with fun facts, so we return a random fun fact from the list of facts
    //getRandomInt returns the floor so no subtraction of 1 is needed here
    res.json({"funfact": duplicate.funfacts[getRandomInt(duplicate.funfacts.length)]});


}

const editFunfact = async (req, res) => {

    //same checking of a state as in the other functions
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }
    // check for duplicate states in the DB
    const duplicate = await State.findOne({ stateCode: state.code }).exec();

    

    //need to check for index and funfact
    //this is a number of checks to make sure the data both exists and is valid
    if(!req.body.index) return res.status(400).json({"message": "State fun fact index value required"}); //may have to change this
    
    if(!Number.isInteger(parseInt(req.body.index))) return res.status(400).json({"message": "Index must be a number entered without quotes"});
    
    if(!req.body.funfact) return res.status(400).json({"message": "State fun fact value required"}); //and this
    
    if(!duplicate) return res.status(400).json({"message": `No Fun Facts found for ${state.state}`})
    
    if(!duplicate.funfacts[req.body.index - 1]) return res.status(400).json({"message": `No Fun Fact found at that index for ${state.state}`});

    //this was a try catch for any weird index out of bounds error that might make it this far
    try {
        //due to the request needing to be non-zero based, we subtract one from the duplicate funfacts array to add
        //the new value to it
    duplicate.funfacts[req.body.index-1] = req.body.funfact;
    duplicate.save();
    res.json(duplicate);

    }

    catch (err){
        console.error(err);
        return res.status(400).json({"message": "An error occurred, index out of bounds"});
    }


}

const deleteFunfact = async (req, res) => {

    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }
    // check for duplicate states in the DB
    const duplicate = await State.findOne({ stateCode: state.code }).exec();

    //some checks to ensure data exists where necessary
    if(!req.body.index) return res.status(400).json({"message": "State fun fact index value required"}); //may have to change this
   
    if(!duplicate) return res.status(400).json({"message": `No Fun Facts found for ${state.state}`});
    
    if(!Number.isInteger(parseInt(req.body.index))) return res.status(400).json({"message": "Index must be a number entered without quotes"});
  
    if(!duplicate.funfacts[req.body.index - 1]) return res.status(400).json({"message": `No Fun Fact found at that index for ${state.state}`});

    //delete item at given element index - 1, which is the true index of the array (passing in 0 would be wrong because it would
    //falsely show a false value

    try {
    duplicate.funfacts.splice(req.body.index - 1, 1);
    duplicate.save();
    res.json(duplicate);
    }
    catch(err){
        console.error(err);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


module.exports = {
    getAllStates,
    getOneState,
    addFunfact,
    getFunfact,
    editFunfact,
    deleteFunfact,
    getStateCapital,
    getStateNickname,
    getStatePopulation,
    getStateAdmission
}