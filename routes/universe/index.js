const routes = require('express').Router();
const util = require('../../util/insert.js');

routes.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Connected!' });
});
  

routes.post('/',  async (req, res) => {
    var connection = await require('../../database/config');
    values = req.body;
    var personIds = [];
    var universeID;
    var familyIDs = [];
    let response;
    try{
        if(values.universename){
            let response = await util.uniqueInsert('UniverseName', 'universe',values.universename);
            res.send(response);
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
  
routes.put('/', (req, res) => {
    
});



module.exports = routes;