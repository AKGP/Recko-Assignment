const routes = require('express').Router();
const util = require('../../util/insert.js');


routes.post('/',  async (req, res) => {
    var connection = await require('../../database/config');
    values = req.body;
    try{
        if(values.personname){
            if(values.familyid){
                if(values.universeid){
                    if(values.power){
                        let family = await connection.execute(`SELECT FamilyID FROM family WHERE FamilyID = ${values.familyid}`);
                        // if familname in family proceed
                            family = family[0];
                            let familyExists = false;
                            let familyID;
                            if(family.length){
                                familyID = family[0].FamilyID;
                                familyExists = true;
                            }
                            // search in map table whether the person within this family exists.If yes then Dont insert it and res that family already has the person
                            if(familyExists){
                                //chek in map table is it already with other family or not;

                                //if yes then check the familyid pased is same or not if same the respond with Already added otherwise
                                //respond that already a member in other family
                                let personID = await connection.execute(`SELECT PersonID from person WHERE PersonName = "${values.personname}"`);
                                
                                if(personID[0].length==1){
                                    let isPersonExists = await connection.execute(`SELECT FamilyID FROM mappersonfamily where PersonID = ${personID[0][0].PersonID}`);
                                    isPersonExists = isPersonExists[0];
                                    if(isPersonExists.length == 1){
                                    familyID = isPersonExists[0].FamilyID;
                                    res.send(`Person with name ${values.personname} already exists in Family ${familyID}`);
                                    } else{
                                        // If in mapping table data not found
                                        res.send({message: 'Error in database mapping table'});
                                    }
                                }else {
                                    let universe = await connection.execute(`SELECT UniverseID FROM universe WHERE UniverseID = ${values.universeid}`);
                                    universe = universe[0];
                                    let universeExists = false;
                                    let universeExistsID;
                                    if(universe.length){
                                        universeExistsID = universe[0].UniverseID;
                                        universeExists = true;
                                    }

                                    if(universeExists){
                                        //check if already a person in the universe in map table;
                                                    let personInsertRes = await util.uniqueInsertPerson(values.personname, values.power);
                                                    if(personID[0].length && personID[0][0].PersonID == personInsertRes.PersonID){
                                                        res.send({message:"Already inserted for the requested Universe"});
                                                    } else{
                                                        // id to be inserted into map table of person-universe, person-family
                                                        let personMapUniverse = await connection.execute(`INSERT INTO mapuniverseperson (UniverseID, PersonID) VALUES("${universeExistsID}","${personInsertRes.PersonID}")`);
                                                        let familyMapUniverse = await connection.execute(`INSERT INTO mapuniversefamily (UniverseID, FamilyID) VALUES("${universeExistsID}","${familyID}")`);
                                                        let familyMapperson = await connection.execute(`INSERT INTO mappersonfamily (PersonID, FamilyID) VALUES("${personInsertRes.PersonID}","${familyID}")`);
                                                        if(personMapUniverse[0].affectedRows && familyMapUniverse[0].affectedRows &&familyMapperson[0].affectedRows){    
                                                            res.send(personInsertRes);
                                                        } else{
                                                            res.send({message:'Error in mapping PersonDetails with Universe Or Family Or Person'});
                                                        }
                                                    }
                                                               
                                    } else{
                                        res.send({message:`Universe with UniverseID ${values.universeid} Not Exist`});
                                    }
                                }                           
                            }else{
                                // else respond with message to create a family
                                res.send({message:`Family with FamilyID ${values.familyid} Not Exist`});
                            }
                    } else{
                        res.send({mesage:"Power of person Missing :("})
                    }
                   
                }else{
                    res.send({mesage:"UniverseID Missing :("})
                }
            } else{
                res.send({mesage:"FamilyID Missing :("})
            }
        } else{
            res.send({mesage:"PersonName Missing :("});
        }
       
    } catch(error){
        console.error(error);
    }
});




module.exports = routes;