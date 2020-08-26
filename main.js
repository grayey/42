const fs = require('fs')  // import file sytem module

let headerProperties = [];
let propertyValues = new Set() // set up unique values;
let propertyKeys = new Set()
let  propertyKeysN = []
let search_metric = 'net_sales';
let groups  = {}


const hierarchicalSort = (data_file, key)=>{
    search_metric =  key; // set search parameter

    fs.readFile(data_file, (err, data) => { 
        if (err) throw err; 
        headerLine = '';
        dataArray = [];
        let lines = data.toString().split('\r\n'); // split text data into separate lines using the new line character '/r/n'
    
        headerLine = lines[0]; // set output header as the first line
        headerProperties = headerLine.split('|');
        propertyKeysN = headerProperties.filter(hp => hp.startsWith('property'))
        console.log('Property keys N ', propertyKeysN)

     
    
            // set rows
            for(let i = 1; i<lines.length; i++){ //skip the first header line, i.e index 0 by starting from i = 1
                line = lines[i];
                dataArray.push(convertLineToPropertiesObject(line))
            }
     
        sortedByTotal = dataArray.sort(compareByTotal)
        console.log('Sorted by Total ::',sortedByTotal)
        groupItems(sortedByTotal)

    }) 
}

/**
 * 
 * @param {*} line 
 * This method takes each line of data and returns a key:value pair matching headerProperties
 */
 const convertLineToPropertiesObject = (line, headerProp, headerIndex)=>{
    const lineArray = line.split('|')
    let dictionary = {};
    headerProperties.forEach((prop, index)=>{ //  each lineArray has the same no of items as 'headerProperties', so indices match
    dictionary[prop] = lineArray[index]
    if(prop.startsWith('property0')){
    propertyKeys.add(prop)
    propertyValues.add(lineArray[index])
    }
    })


    return sortRowTotal(dictionary);
}

const groupByParent = (dict, key) =>{
    let grouped = []
    if(key in groups){
        console.log('in groups')
    }else{
        console.log('in groups')
    }
}


/**
 * 
 * @param {*} a '
 * @param {*} b 
 * 
 * This method sorts an array of objects in descending order (highest first), using the search metric specified in cli
 */
const compareByMetric = (a,b) =>{
    // convert values to float
    a_val = parseFloat(a[search_metric]) 
    b_val = parseFloat( b[search_metric])

    //compare values
    // return a_val - b_val // lowest first

    return b_val - a_val // highest first
}

const compareByTotal = (a, b) =>{
    return  b['row_total'] - a['row_total'] //highest first
}

const searchByProperty =()=>{

}

const sortRowTotal = (rowDict)=>{
    row_total = 0;
     
    for(let pIndex = 0; pIndex < propertyKeysN.length; pIndex++ ){
        if(rowDict[propertyKeysN[pIndex]] == '$total'){
            row_total+=1;
        }
    }
    rowDict['row_total'] = row_total;

    return rowDict;

}

const groupItems = (sorted) =>{
  
    dict = {}
    dictArray = [];
    for(let value of propertyValues){
        dict[value] = []
        for(let key of propertyKeys){
                dict[value] = sorted.filter((s)=>{
                    return s[key] == value
                })
           
        }
        dict[value].sort(compareByTotal)
        
    }
    console.log(dict)

   
    
   

}

const rearrangeTotals = (dict)=>{
    for(k in dict){
        key_value = k.split('_');
        key = key_value[0];
        value = key_value[1];
        rearranged = setTotal(dict[k],key,value)
        console.log('Rearranged',k ,rearranged)
    }
}

const setTotal = (array, key, value)=>{
    newArray = [...array]
    if(value == '$total'){
        totalIndex = newArray.findIndex((a)=>{
             a[key] == '$total'
             
        })
        tempObj = {...newArray[totalIndex]}
        if(totalIndex !== 0){
            console.log('Before',newArray )
            
            newArray.splice(0, 0, newArray.splice(totalIndex, 1)[0]); 
            // newArray.splice(totalIndex,1) // remove from position 
            // newArray.unshift(tempObj) // insert at the top
            console.log('After',newArray )
        }
       
    }
    return newArray
}

 const writeOutput = ()=>{

 }


/**
 * This is the main method that runs hierarichical sort. 
 * It optionally takes positional command line arguments for source text file, and sort metric respectively
 */
const main = () => {
    cli_args = process.argv.slice(2)
    data_file = cli_args[0]; // txt file path
    key = cli_args[1] || search_metric; // search_metric
    hierarchicalSort(data_file, key)
}

main();

