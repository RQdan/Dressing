;(function() {
'use strict';

angular.module('SkillsSet_01', [])
.controller('SkillsListGeneral', SkillsListGeneral)
.controller('SkillsListCustom', SkillsListCustom)
.service('CustomSkills', CustomSkillsService);

SkillsListGeneral.$inject = ['CustomSkills', '$http', '$q'];
function SkillsListGeneral(CustomSkills, $http, $q) {

    var listGeneral = this;
    
    listGeneral.curSubCategory = '';
    listGeneral.displaySkillDescription = [];
    listGeneral.skillsList = [];
    listGeneral.subCategoriesList = [];
    
    var promise = GetSkillsList();
    promise.then(function(result) {
    
        listGeneral.skillsList = result;
        listGeneral.subCategoriesList = GetSubCatList(listGeneral.skillsList.reverse());
    
    }, function(errorMessage) {
    
        console.log(errorMessage);
    
    });
    
    listGeneral.chooseSkill = function(index) {
    
        CustomSkills.chooseSkill(listGeneral.skillsList[index]);
    
    }
    
    listGeneral.setSubCategory = function(index) {
    
        listGeneral.curSubCategory = listGeneral.subCategoriesList[index];
    
    }

    listGeneral.clickOnSkill = function(skill) {
    
        var pos = listGeneral.displaySkillDescription.indexOf( skill );
        if( ~pos ) {
        
            listGeneral.displaySkillDescription.splice( pos, 1 );
            console.log('Remove ', skill);
        
        } else {
        
            listGeneral.displaySkillDescription.push( skill );
            console.log('Add ', skill);
        
        }
    
    }
    
    function GetSkillsList() {
        
        var deffered = $q.defer();
        var loaded = [];
        $http({
            url: ('shortened_EmpiaSkills_03.02.18.json')       
        }).then(function(response) {
            
            deffered.resolve(response.data.reverse());
        
        }, function(error) {
        
            deffered.reject(error);
        
        });
        
        return deffered.promise;
    
    }
    
    function GetSubCatList(list) {
    
        var subCatList = [];
        
        list.forEach( function(entry) {
        
            if( !~subCatList.indexOf(entry.subCategory) ) {
            
                subCatList.push(entry.subCategory);
            
            }
        
        });
        
        return subCatList.reverse();
    
    }
    
    //виключно для випадку нередагованого json
    function GetSkillsListRawSource() {
        
        var deffered = $q.defer();
        var loaded = [];
        $http({
            url: ('Empia_skillsListScrapper_2018-02-02T16_11_21_790Z.json')       
        }).then(function(response) {
        
            var shortArr = response.data.map(function(item) {
                
                var newItem = item.data;
                delete newItem.source_url;
                return newItem; 
            
            });

            deffered.resolve(shortArr);
            //console.log(JSON.stringify(shortArr));
        
        }, function(error) {
        
            console.log(error.message);
        
        });
        
        return deffered.promise;
    
    }
}

SkillsListCustom.$inject = ['CustomSkills'];
function SkillsListCustom(CustomSkills) {

    var listCustom = this;
    listCustom.displaySkillDescription = [];
    listCustom.skillsList = CustomSkills.getSkillsList();
    
    listCustom.removeSkill = function(index) {
    
        CustomSkills.removeSkill(index);
    
    }
    
    listCustom.clickOnSkill = function(skill) {
    
        var pos = listCustom.displaySkillDescription.indexOf( skill );
        if( ~pos ) {
        
            listCustom.displaySkillDescription.splice( pos, 1 );
            console.log('Remove ', skill);
        
        } else {
        
            listCustom.displaySkillDescription.push( skill );
            console.log('Add ', skill);
        
        }
    
    }
}

function CustomSkillsService() {

    var service = this;
    var skills = {list: [], totalPrice: 0};
    service.chooseSkill = function(skill) {
    
        skills.list.push(skill);
        skills.totalPrice += skill.price;
    
    }
    service.removeSkill = function(index) {
    
        skills.totalPrice -= skills.list[index].price;
        skills.list.splice(index, 1);
    
    }
    service.getSkillsList = function() {
    
        return skills;
    
    }

}

})();
