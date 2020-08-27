const fs = require('fs');  // import file sytem module
const { getMaxListeners } = require('cluster');

let headerProperties = [];
let propertyValues = new Set() // set up unique values;
let propertyKeys = new Set()
let  propertyKeysN = []
let search_metric = 'net_sales';
let output  = {}
let headerLine = '';


const hierarchicalSort = (data_file, key)=>{
    search_metric =  key; // set search parameter

    fs.readFile(data_file, (err, data) => { 
        if (err) throw err; 
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
        output = groupItems(sortedByTotal)
    
        // let totalObjectArray;
        // for(key in output){
        //     if(key = '$total'){
        //         totalObjectArray = output['total'] 
        //     }
        // }
        // delete output['$total']
        finalGroup = {...output}
        outputArray = doFinalGroup(finalGroup)
        console.log('Sorted Output :: ', output)

         writeOutput(outputArray)



    //   testArray =  [
    //         {
    //           property0: 'bar',
    //           property1: 'sup',
    //           net_sales: '-400',
    //           row_total: 0
    //         },
    //         {
    //           property0: 'bar',
    //           property1: 'bro',
    //           net_sales: '200',
    //           row_total: 0
    //         }
    //       ].sort(compareByMetric)

        //   console.log('Test Array', testArray)

    }) 
}

const doFinalGroup = (partial_output)=>{
    partialOutArray = [];
    totalObject = {
        'search_metric_total':'infinity',
        '$total':null
    };
    for(key in partial_output){
        if(key == '$total'){
            totalObject['$total'] = partial_output[key]
            continue;
        }
        dict = {
            'search_metric_total':sumMetricValues(partial_output[key]),
            [key]:partial_output[key]
        }
        partialOutArray.push(dict)
    }
    partialOutArray = partialOutArray.sort(compareByMetricTotal);
    partialOutArray.unshift(totalObject);
    return partialOutArray;

    console.log('partialOutArray',partialOutArray)
}

const sumMetricValues = (data) =>{
   let metricSum = 0;
   data.forEach(datum=>{
    metricSum += + datum[search_metric]
   })
   return metricSum;
}

const compareByMetricTotal = (a,b)=>{
    return  b['search_metric_total'] - a['search_metric_total'] 
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

const sortRowTotal = (rowDict, directIndex=false)=>{
    row_total = 0;
     if(!directIndex){
        for(let pIndex = 0; pIndex < propertyKeysN.length; pIndex++ ){
            if(rowDict[propertyKeysN[pIndex]] == '$total'){
                row_total+=1;
            }
        }
        rowDict['row_total'] = row_total;
     }
    //  else{
    //     for(let key in rowDict ){
    //         inner_total = 0
    //         rowDict[key].forEach((r)=>{
    //             inner_total += r['row_total']
    //         })
    //         rowDict[key]['row_total'] = inner_total
         
          
    //     }
    //     // rowDict['row_total'] = row_total;
      
    //  }
   
  
    return rowDict;

}

const groupItems = (sorted) =>{
    let dict = {}
    let dictArray = []
    for(let value of propertyValues){
        dict[value] = []
        for(let key of propertyKeys){
                dict[value] = sorted.filter((s)=>{
                    delete s['row_total']
                    return s[key] == value
                })
           
        }
        totalObject = {...dict[value][0]} // copy the 'total' object
        dict[value].splice(0,1) // remove 'total' object
        dict[value].sort(compareByMetric) // sort the others by metric
        dict[value].unshift(totalObject)  // put the 'total' object back on top
        console.log('Total Object',totalObject)
        // dict[value] = dict[value].sort(compareByTotal)
        
    }
    return dict;

   
    
   

}

// const rearrangeTotals = (dict)=>{
//     for(k in dict){
//         key_value = k.split('_');
//         key = key_value[0];
//         value = key_value[1];
//         rearranged = setTotal(dict[k],key,value)
//         console.log('Rearranged',k ,rearranged)
//     }
// }

// const setTotal = (array, key, value)=>{
//     newArray = [...array]
//     if(value == '$total'){
//         totalIndex = newArray.findIndex((a)=>{
//              a[key] == '$total'
             
//         })
//         tempObj = {...newArray[totalIndex]}
//         if(totalIndex !== 0){
//             console.log('Before',newArray )
            
//             newArray.splice(0, 0, newArray.splice(totalIndex, 1)[0]); 
//             // newArray.splice(totalIndex,1) // remove from position 
//             // newArray.unshift(tempObj) // insert at the top
//             console.log('After',newArray )
//         }
       
//     }
//     return newArray
// }

 const writeOutput = (output)=>{
 outputArray = []
     output.forEach(o=>{
         for(key in o){
             if(key == 'search_metric_total'){
                 continue
             }
             outputArray = outputArray.concat(o[key])
         }
     })

     printOut(outputArray)
    

 }

 const printOut = (outputArray) =>{
    lines = headerLine+'\n';
    outputArray.forEach((y)=>{
        keys = Object.keys(y);
        for(let k = 0; k <keys.length; k++){
            addPipe = (k != keys.length -1)
            pipe = addPipe ?'|':''
            propIndex = keys[k]
           lines += `${y[propIndex]}${pipe}`
        }
        lines += '\n'
    })
    fs.writeFile('main.output.txt',lines, function (err) {
        if (err) throw err;
        console.log('Output written');
      });
  
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

