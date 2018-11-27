const routes = require('express').Router();
const util = require('../../util/insert.js');
const {Constants} = require('../../util/constants.js');
var asyncjs = require('async');
routes.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Connected!' });
});
  

routes.post('/', async (req, res) => {
    
    values = req.body;
    
    try{
        if(values.familyname){
            if(!values.universe || values.universe&&values.universe.length == 0){
                res.send({
                    success:false,
                    message:'Universe name missing, Please pass universe in a list'
                });
            } else {
                let response = await util.uniqueInsert('FamilyName', 'family',values.familyname);
                if(response && response.FamilyID){
                    let tasks = {};
                    values.universe.forEach(el=>{
                        tasks[el] = async ()=>{
                            return await util.uniqueInsert('UniverseName', 'universe',el);
                        }
                    });

                    console.log(tasks);
                    let universeResponse = {};
                    let _res = await new Promise(async (resolve, reject)=>{
                        await asyncjs.parallel( asyncjs.reflectAll(tasks), (error, results)=>{
                            if(error){
                                reject(error);
                            } 
                            for(var i in results){
                                delete results[i].value.UniverseName;
                            universeResponse[i] = results[i].value;
                            }
                            resolve(results);
                        } );
                    });
                    finalResponse = {
                        FamilyID : response.FamilyID,
                        UniverseIDs : universeResponse
                    }
                    let mapResponse = await util.uniqueInsertUniverseFamily([{ids:['UniverseID','FamilyID']}, 
                            {table:['mapuniversefamily']},
                            {values:finalResponse}]);
                    if(mapResponse.success){
                        res.send(finalResponse);
                    }else{
                        res.send({success:false, message:"Some error in inserting data"});
                    }
                }
            }
        } else{
            res.send({
                success: false,
                message:'universename required in req body'
            });
        }
    } catch(error){
        console.error(error);
    }
});


routes.get('/:uid', async (req, res)=>{
    var connection = await require('../../database/config.js');
    try{
        let query = `${Constants.Query.getAllFamilyinUniverse} WHERE UniverseID = "${req.params.uid}"`;
        let response = await connection.execute( query );
        if(response[0].length){
            res.send(response[0]);
        } else{
            res.send('No Family in this universe');
        }

    } catch(error){
        console.error(error);
        res.send(err);
    }
});

routes.get('/isbalanced/:fid', async (req, res)=>{
    let familyID = req.params.fid;
    var connection = await require('../../database/config.js');
    try{
        let response = await util.getBalanceDS(familyID);
        var set = new Set(response.powers);
        if(set.size == 1){
            res.send({message:'Yes this family is balanced'});
        } else{
            res.send({message:'This family is unbalanced'});
        }
       
    } catch(error){
        console.error(error);
    }
});
  

routes.get('/balance/all', async (req, res)=>{
    var connection = await require('../../database/config.js');
    try{
        let familyIds = await connection.execute(`SELECT FamilyID from family`);
        familyIds = familyIds[0];
        let length = 0;
        
        result = {
            unbalanced:[],
            balanced:[],
            afterBalance:[]
        }
        let tasks = {};
        familyIds.forEach(el=>{
            tasks[el.FamilyID] = async ()=>{
                return await util.getBalanceDS(el.FamilyID);
            }
        });


        let results = await new Promise((resolve, reject)=>{
            asyncjs.parallel(asyncjs.reflectAll(tasks), (error, results)=>{
                if(error){
                    reject(error);
                }
                resolve(results);
            });
        });

        for(var i in results){
            var set = new Set(results[i].value.powers);
            if(set.size==1){
                result.balanced.push(i);
            } else{
                result.unbalanced.push(i);
            }

            
            let currentfamily = results[i].value;
            let minimumPowerSum = Math.min.apply(null,currentfamily.power);
            let temp = currentfamily.DS;
            for(var j in temp){
                let offset = minimumPowerSum - temp[j].power_sum;
                // adjust with minimum power
                temp[j].power_sum = minimumPowerSum;
                // adjust the offset with any one of the person
                temp[j].persons[0].power = temp[j].persons[0].power + offset

            }
            delete currentfamily.power;
            result.afterBalance.push(currentfamily);
        }

        res.send(result);

        res.send(result);

    } catch(error){
        console.error(error);
    }
});
  



module.exports = routes;