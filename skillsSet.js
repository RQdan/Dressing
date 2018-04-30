;(function() {
'use strict';

angular.module('SkillsSet_01', [])
.controller('SkillsListGeneral', SkillsListGeneral)
.controller('SkillsListCustom', SkillsListCustom)
.controller('EventsNote', EventsNote)
.service('CustomSkills', CustomSkillsService);

SkillsListGeneral.$inject = ['CustomSkills', '$http', '$q'];
function SkillsListGeneral(CustomSkills, $http, $q) {

    var listGeneral = this;
    
    listGeneral.curSubCategory = '';
    listGeneral.displaySkillDescription = [];
    listGeneral.skillsList = [];
    listGeneral.subCategoriesList = [];
    listGeneral.chosenSkillsList = CustomSkills.getChosenSkillsList();
    
    var promise = LoadSubCategoriesList();
    promise.then(function(result) {
    
        listGeneral.subCategoriesList = result;
    
    }, function(errorMessage) {
    
        console.log(errorMessage);
    
    });
    
    listGeneral.chooseSkill = function(index) {
    
        CustomSkills.chooseSkill(listGeneral.skillsList[index]);
    
    };
    
    // вибір підкатегорії
    listGeneral.chooseSubCategory = function(index) {
        
        // якщо підкатегорія не містить здібностей - завантажити
        if( listGeneral.subCategoriesList[index].skillsList === undefined ) {
        
            var promise = LoadSubCategorySkillsList( listGeneral.subCategoriesList[index].path );
            promise.then( function(response) {
            
                listGeneral.subCategoriesList[index].skillsList = response;
                listGeneral.skillsList = listGeneral.subCategoriesList[index].skillsList;
            
            }, function( error ) {
            
                console.log( 'error loading skills list: ', error );
            
            } );
        
        } else {
        
            listGeneral.skillsList = listGeneral.subCategoriesList[index].skillsList;
        
        } 
    
        function LoadSubCategorySkillsList( path ) {
        
            var deffered = $q.defer();
            $http( {
                url: (path)
            } ).then( function( response ) {
            
                deffered.resolve( response.data );
            
            }, function( error ) {
            
                deffered.reject( error.message );
            
            } );
            
            return deffered.promise;
        
        }
    
    };

    // показ\ховання опису здібності при натисканні
    listGeneral.clickOnSkill = function(skill) {
    
        var pos = listGeneral.displaySkillDescription.indexOf( skill );
        if( ~pos ) {
        
            listGeneral.displaySkillDescription.splice( pos, 1 );
        
        } else {
        
            listGeneral.displaySkillDescription.push( skill );
        
        }
    
    };
    
    // перевірка доступності здібності для вибору по: кількості екземплярів
    listGeneral.isSkillEnableByCount = function(skill) {
    
        return CustomSkills.IsSkillEnable(skill);
    
    };
    
    // наявність в списку здібностей, від яких залежить вибір данної
    listGeneral.isSkillEnableByRequirements = function( skill ) {
        
        if( skill.stats.statControl[1004] === undefined ) return true;
        
        if( skill.stats.statControl[1004].every( function( requirement ) {
        
            return CustomSkills.meetRequirements( requirement );
        
        } ) ) return true;
        
        return false;        
   
    };
    
    listGeneral.hasConflict = function( skill ) {
        
        if( skill.stats.statControl[1006] === undefined ) return false;
        
        var conflictSkills = skill.stats.statControl[1006];
        
        if( conflictSkills.some( function( skillId ) {
        
            return CustomSkills.IsSkillInList( skillId );
        
        } ) ) return true;
        
        return false;
    
    }
    
    // завантаження списку підкатегорій з файлу
    function LoadSubCategoriesList(list) {
    
        var deffered = $q.defer();

        $http( {
            url: ('./SubCategories/SubCategoriesList.json')
        } ).then( function(response) {
            
            deffered.resolve( response.data );
        
        }, function( error ) {
        
            console.log('Error loading subcategories list:', error.message);
            
            deffered.reject(error.message);
        
        } );
        
        return deffered.promise;
    
    }
    
    //сортування здібностей по ціні і алфавіту
    listGeneral.getOrderedSkillsList = function() {
        
        var promise = ( function() {
            
            var deffered = $q.defer();
            
            var orderedSkills = _.cloneDeep( listGeneral.skillsList );
            orderedSkills.map( function(a) {
            
                delete a['$$hashKey'];
            
            });
            orderedSkills.sort( function(a, b) {
        
                if( +a.price > +b.price ) return 1;
                if( +a.price < +b.price ) return -1;
                if( a.skill > b.skill ) return 1;
                return -1;
        
            } );
        
            deffered.resolve( orderedSkills );
            
            return deffered.promise;
            
        } )();
        
        promise.then( function( response ){
        
            console.log( JSON.stringify( response ) );
            listGeneral.skillsList = response;
        
        }, false );  
    
    };
 
}

SkillsListCustom.$inject = ['CustomSkills'];
function SkillsListCustom(CustomSkills) {

    var listCustom = this;
    listCustom.displaySkillDescription = [];
    listCustom.displayNoSubCategorySkillsList = [];    
    listCustom.skillsNumberOnCategory = [];
    listCustom.skillsList = CustomSkills.getSkillsList();
    
    listCustom.removeSkill = function(index) {
    
        CustomSkills.removeSkill(index);
    
    };
    
    listCustom.clickOnSkill = function(skill) {
    
        var pos = listCustom.displaySkillDescription.indexOf( skill );
        if( ~pos ) {
        
            listCustom.displaySkillDescription.splice( pos, 1 );
        
        } else {
        
            listCustom.displaySkillDescription.push( skill );
        
        }
    
    };
    
    listCustom.clickOnSubCategory = function(subCategory) {
    
        var pos = listCustom.skillsList.displaySubCategorySkillsList.indexOf( subCategory );
        if(~pos) {
        
            listCustom.skillsList.displaySubCategorySkillsList.splice( pos, 1);            
        
        } else {
        
            listCustom.skillsList.displaySubCategorySkillsList.push( subCategory );
        
        }
    
    };

    listCustom.getSkillsOnSubCategory = function( subCategory) {
    
        var count = 0;
        listCustom.skillsList.list.forEach( function( skill ) {
            if( skill.subCategory === subCategory ) count++;
        });
        
        return count;
    };
    
    listCustom.getExpSpendOnSubCategory = function( subCategory) {
    
        var sum = 0;
        listCustom.skillsList.list.forEach( function( skill ) {
            if( skill.subCategory === subCategory ) sum += skill.price;
        });
        
        return sum;
    };
    
}

function CustomSkillsService() {

    var service = this;
    var skills = {
        list: [], 
        totalPrice: 0,
        subCategories: [],
        displaySubCategorySkillsList: []
        };
    var chosenSkillsList = {};
    
    // додавання здібності у список
    service.chooseSkill = function(skill) {
        
        var posIns = GetPosToInsertSkill(skills.list, skill);
        skills.list.splice(posIns, 0, skill);
        
        skills.totalPrice += skill.price;
        if(skills.subCategories.indexOf(skill.subCategory) === -1) {
        
            skills.subCategories.push(skill.subCategory);
        
        }
        var pos = skills.displaySubCategorySkillsList.indexOf( skill.subCategory );
        if(pos === -1) {
            skills.displaySubCategorySkillsList.push( skill.subCategory );
        }
        
        function GetPosToInsertSkill(list, skill) {
        
            if(list.length === 0) return 0;
            
            if(list[ list.length - 1 ].price < skill.price) return list.length;
            
            if( (list[ list.length - 1 ].price === skill.price) && 
            (list[ list.length - 1 ].skill < skill.skill) ) return list.length;
            
            var pos = 0;
            while( list[pos].price < skill.price ) pos++;
            
            while( (list[pos].price === skill.price) && (list[pos].skill < skill.skill) ) 
                pos++;
            
            return pos;
        
        }
        
        //збільшення кількості екземплярів здібності, що були додані до набору
        ChangeChosenSkillsList(skill, true);
    
    };
    
    // видалення здібності зі списку
    service.removeSkill = function(index) {
    
        
        var skill = skills.list[ index ];
        
        //зменшення кількості екземплярів здібності, що були додані до набору
        ChangeChosenSkillsList(skill, false);       
        
        // видалення здібності зі списку
        skills.totalPrice -= skill.price;
        var subCat = skill.subCategory;
        skills.list.splice(index, 1);
        
        // видалення категорії здібності з списку категорії, якщо в ній
        // не залишилось жодної здібності
        if(skills.list.some(function(skill) {
        
            return skill.subCategory === subCat;
        
        }) === false) {  
            
            skills.subCategories.splice( skills.subCategories.indexOf(subCat), 1 );
        
        }
        
        // рекурсійний пошук і видалення здібностей, які залежать від видаленої
        if( ( Boolean( chosenSkillsList[ skill.id.subCategoryId ] ) && ( Boolean( chosenSkillsList[ skill.id.subCategoryId ][ skill.id.skillId ] ) ) ) === false ) {        

            var linkedSkillIndex = GetLinkedSkillIndex( skill.id );

            while( ~linkedSkillIndex ) {
            
                service.removeSkill( linkedSkillIndex );
                
                linkedSkillIndex = GetLinkedSkillIndex( skill.id );
                
            }
   
        }
        
    };
    
    service.getSkillsList = function() {
    
        return skills;
    
    };
    
    service.getChosenSkillsList = function() {
    
        return chosenSkillsList;
    
    };
    
    // доступність здібності для вибору по: кількості екземплярів
    service.IsSkillEnable = function(skill) {
        
        if( chosenSkillsList[skill.id.subCategoryId] === undefined ) 
          return true;
      
        if( chosenSkillsList[skill.id.subCategoryId][skill.id.skillId] === 
           undefined ) return true;
        
        if( chosenSkillsList[skill.id.subCategoryId][skill.id.skillId] < 
           skill.stats.statControl[1001] ) return true;
            
        return false;
    
    };
    
    service.IsSkillInList = function( skillId ) {
    
        if( chosenSkillsList[ skillId.subCategoryId ] === undefined ) return false;
        
        //ANY means for all skills in particular subCategory
        if( skillId.skillId === "ANY" ) return true;
        
        return chosenSkillsList[ skillId.subCategoryId ][ skillId.skillId ];
    
    };
  
  service.meetRequirements = function MeetRequirements( requirement ) {
            
            if( requirement === undefined ) return true;
            
            switch ( requirement.type ) {
            
                case 'OR': {
                
                    return MeetRequirementsOR( requirement.list );
                
                }
                case 'AND': {
                
                    return MeetRequirementsAND( requirement.list );
                
                }
                case 'NOT': {
                
                    return MeetRequirementsNOT( requirement.list );
                
                }
                
                default: return service.IsSkillInList( requirement );
            
            }
        
        }
        
        function MeetRequirementsOR( list ) {
        
            return list.some( function( requirement ) {
            
                return service.meetRequirements( requirement );
            
            } );
        
        }
        
        function MeetRequirementsAND( list ) {
        
            return list.every( function( requirement ) {
            
                return service.meetRequirements( requirement );
            
            } );
        
        }
        
        function MeetRequirementsNOT( list ) {
        
            return list.every( function( requirement ) {
            
                return !service.meetRequirements( requirement );
            
            } )
        
        }

  
  
  function ChangeChosenSkillsList( skill, addBool ) {
    
    if( addBool ) {
      
      chosenSkillsList[ skill.id.subCategoryId ] = 
        chosenSkillsList[ skill.id.subCategoryId ] || {};
      
      chosenSkillsList[ skill.id.subCategoryId ][ skill.id.skillId ] = 
        ++chosenSkillsList[ skill.id.subCategoryId ][ skill.id.skillId ] || 1;
      
    } else {
      
      --chosenSkillsList[ skill.id.subCategoryId ][ skill.id.skillId ];
      
      if( chosenSkillsList[ skill.id.subCategoryId ][ skill.id.skillId ] === 0 ) {
      
        delete chosenSkillsList[ skill.id.subCategoryId ][ skill.id.skillId ];
        
        if( Object.keys( chosenSkillsList[ skill.id.subCategoryId ] ).length === 0 ) {
        
            delete chosenSkillsList[ skill.id.subCategoryId ];
        
        }
      
      }
      
    }
    
  }
  
  function GetLinkedSkillIndex( id ) {

    var index = -1;
    
    skills.list.some( function( skill, i ) {
    
        if( skill.stats.statControl[1004] === undefined ) return false;
        
        if( !skill.stats.statControl[1004].every( function( requirement ) {
        
            if( service.meetRequirements( requirement ) ) return true;
        
        } ) ) {
        
            index = i;
            return true;
        
        }
    
    } );
    
    return index;
  
  }

}

EventsNote.$inject = ['$http', '$q'];
function EventsNote( $http, $q ) {
    
    var eventsNote = this;
    eventsNote.messages = [];
    
    var promise = (function() {
    
        var deffered = $q.defer();
        $http({
            'url': ('events.json')
        }).then(function(response){
        
            return deffered.resolve(response.data);
        
        }, function(error) {
            
            return deffered.reject(error);
        
        });
        
        return deffered.promise;
    
    } ) ();
    
    promise.then( function(result) {
    
        eventsNote.messages = result.reverse();
    
    }, function(errorMessage) {
    
        console.log( errorMessage );
    
    } );
    
    eventsNote.closeEventsNote = function() {
    
        var el = angular.element( document.querySelector( '.eventsNote' ) );
        el.addClass( 'closed' );
    
    };
    
    eventsNote.setMessage = function(index) {
        
        var el = angular.element( document.querySelectorAll( '.message' )[index] );
        el.html( eventsNote.messages[index].message );
    
    };

}

        

})();
