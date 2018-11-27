module.exports = {

    uniqueInsert : async (field, table, value)=>{
        var connection = await require('../database/config');
        try{
            let response;
            let tempCheck = await connection.
            execute(`SELECT * from ${table} WHERE ${field} = "${value}"`);
            console.log(tempCheck[0]);
            if(tempCheck[0][0]){
                response = tempCheck[0][0];
            } else{
            tempCheck = await connection.
            execute(`INSERT INTO ${table} (${field}) VALUES ("${value}")`);
            if(table == 'universe'){
                response = {
                    UniverseID: tempCheck[0].insertId,
                    UniverseName: value
                }
            } else if(table == 'person'){
                response = {
                    PersonID: tempCheck[0].insertId,
                    PersonName: value
                }
            } else if(table == 'family'){
                response = {
                    FamilyID: tempCheck[0].insertId,
                    FamilyName: value
                }
            }

            
            }
        return Promise.resolve(response);
        } catch(error){
            Promise.reject(error);
        }
        
    },


    uniqueInsertUniverseFamily: async (args)=>{
        var connection = await require('../database/config');
        var universeIDs = args[2].values.UniverseIDs;
        try{
            let response;
            let tempCheck = await connection.
            execute(`SELECT UniverseID from ${args[1].table[0]} WHERE ${args[0].ids[1]} = "${args[2].values.FamilyID}"`);
            
            if(tempCheck[0]){
                let universeIdList = args[2].values.UniverseIDs;
                let universeIdListToInsert = [];
                
                for(var i in universeIdList){
                    let success = true;
                    tempCheck[0].forEach(element => {
                        if(element.UniverseID == universeIdList[i].UniverseID){
                             success = false;
                             return;
                        }
                    });

                    if(success){
                        universeIdListToInsert.push(universeIdList[i].UniverseID);
                    }
                }
                let values = '';
                for (var i of universeIdListToInsert){
                    values = `${values}(${i},${args[2].values.FamilyID}),`
                }
                if(universeIdListToInsert.length){
                    values = values.substring(0,values.length-1);
                    tempCheck = await connection.
                    execute(`INSERT INTO ${args[1].table[0]} (${args[0].ids[0]}, ${args[0].ids[1]}) VALUES ${values}`);
                    if(tempCheck[0].affectedRows){
                        return Promise.resolve({success:true});
                    }
                    else{
                        return Promise.reject({success:false});
                    }
                }
                else{
                    return Promise.resolve({success:true, message:'Already data with the name available in database :) '});
                }
                
                
                
                
            }
        } catch(error){
            Promise.reject(error);
        }
    },

    uniqueInsertPerson : async (personName, power)=>{
        var connection = await require('../database/config');
        try{
            let response;
            let tempCheck = await connection.
            execute(`SELECT * from person WHERE PersonName = "${personName}"`);
            console.log(tempCheck[0]);
            if(tempCheck[0][0]){
                response = tempCheck[0][0];
            } else{
            tempCheck = await connection.
            execute(`INSERT INTO person (PersonName, POWER) VALUES ("${personName}", "${power}")`);
                response = {
                    PersonID: tempCheck[0].insertId,
                    PersonName: personName
                }
            }
        return Promise.resolve(response);
        } catch(error){
            Promise.reject(error);
        }
        
    },

    getBalanceDS: async (familyID)=>{
        try{
            var connection = await require('../database/config.js');
            return new Promise(async (resolve, reject)=>{
                let universes = await connection.execute(`SELECT Distinct UniverseID from mapuniversefamily where FamilyID = ${familyID}`);
                let universeList = universes[0];
                let persons = await connection.execute(`SELECT PersonID from mappersonfamily where FamilyID = ${familyID}`);
                let personList = persons[0];
        
                let balanceDS = {};
                universeList.forEach(el=>{
                    if(!balanceDS[el.UniverseID]){
                        balanceDS[el.UniverseID] = {
                            persons:[],
                            power_sum:0
                        };
                    }
                });
        
                for (var i in personList){
                    let uID = await connection.execute(`SELECT UniverseID from mapuniverseperson WHERE PersonID = ${personList[i].PersonID}`)
                    let Power = await connection.execute(`SELECT POWER FROM person WHERE PersonID = ${personList[i].PersonID}`)
                    Power = Power[0];
                    balanceDS[uID[0][0].UniverseID].persons.push({personid:personList[i].PersonID, power:Power[0].POWER});
                }
                let powers = [];
                for (var i in balanceDS){
                    let power_sum = 0;
                        let strArrayPersonID = "";
                        balanceDS[i].persons.forEach(el=>{
                            strArrayPersonID+=el.personid+',';
                        });
        
                        if(strArrayPersonID.length){
                            strArrayPersonID = strArrayPersonID.substr(0,strArrayPersonID.length-1);
                        }
        
                        let power = await connection.execute(`SELECT POWER FROM person WHERE PersonID IN (${strArrayPersonID})`);
                        power= power[0];
                        if(power.length){
                            power.forEach(el=>{
                                power_sum+=el.POWER;
                            });
        
                            balanceDS[i].power_sum = power_sum;
                            powers.push(power_sum);
                        }
                }
                resolve({DS:balanceDS, power:powers});        
            });
        } catch(error){
            return Promise.reject(error);
        }
        
    }
}