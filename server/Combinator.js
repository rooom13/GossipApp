var COMBINATOR = {

    // Fields to combine
    fields : {},

    addField : function(fieldName, fieldValues){
        COMBINATOR.fields[fieldName] = fieldValues;
    },
    // Already taken indexes
    taken : [],

    /* Random Index generator
        Returns object with .index & .string    (string version of index)
    */
    generateRandomIndex(){
        var index = {index:{}, string: ""};

        for(field in COMBINATOR.fields){
            var i = (Math.floor(Math.random() * COMBINATOR.fields[field].length) );
            index.index[field] = i;
            index.string += i.toString() + ".";
        }
        return index;
    },
    /*
        Given an index, retrieves the values of the field list
    */
    generateCombination(index){
        var combination = {};
        for(field in COMBINATOR.fields){
            combination[field] = COMBINATOR.fields[field][index[field]];
        }
        return combination;
    },

    // Resets already taken list
    reset : function(){
        COMBINATOR.taken = [];
    },

    /*  Returns object with field combination
        This object have specified fields in init
    */
    getCombination : function(){

        var found = false;
        var itCount = 0;
        var index = {};
        var combination = {};

        //While not found or too many iterations
        while(!found && itCount < 50 ){
            ++itCount;
            var stringIndex = "";

            //Choose random index
            var indexAux = COMBINATOR.generateRandomIndex();
            index = indexAux.index;
            stringIndex = indexAux.string;

            if(COMBINATOR.taken.includes(stringIndex) ){
            }else {
                COMBINATOR.taken.push( stringIndex );
                found = true;
            }
        }

        if(found){
            combination = COMBINATOR.generateCombination(index);
        } else {
            combination = {name :"Hackerman", adjective: "Pro", color: "grey"};
        }
        return combination;

    },
}


exports.COMBINATOR = COMBINATOR;
