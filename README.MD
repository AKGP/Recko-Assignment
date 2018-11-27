###Create tables 
person, family, universe, mapuniverseperson, mapuniversefamily, mappersonfamily in local mysql
person - fields are [PersonID, POWER, PersonName]
family - fields are [FamilyID, FamilyName]
universe - fields are [UniverseID, UniverseName]
mapuniverseperson - fields are [UniverseID, PersonID]
mapuniversefamily - fields are [UniverseID, FamilyID]
mappersonfamily - fields are [PersonID, FamilyID]


###Data Insertion Docs
Request can be found on postman link : https://www.getpostman.com/collections/91b619e6fb05d9ea5cc9
first we will insert using request named "Family-Insert".
then we will insert each person one by one using request named Person-Insert.
we can also add universe too request named "Universe-Insert".
for all above follow the link 

###Solutions:
1. getting family list in a universe
   use api localhost:8087/api/family/{universeid}
2. Check if families with same identifiers have same power in all universes
   use api localhost:8087/isbalanced/{familyid}
3. Find unbalanced families and balancing them
   use api localhost:8087/api/family/balance/all
   it will respond with balancedPowerValue and all the balanced and unbalanced families
