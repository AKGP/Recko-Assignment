module.exports.Constants = {
    Query:{
        getAllFamilyinUniverse : "SELECT DISTINCT FamilyName from mapuniversefamily as uf INNER JOIN family as f ON uf.FamilyID = f.FamilyID"
    }
}