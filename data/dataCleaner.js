    var saveToFile = function(object, filename){
        var blob, blobText;
        blobText = [JSON.stringify(object)];
        blob = new Blob(blobText, {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, filename);
    }
    

    d3.csv("globalenergyuse-production.csv", function(data) {
        // get all existing codes
        var codes = []
        function isInArray(value, array) {
            return array.indexOf(value) > -1;
        }

        data.forEach(function(row){
            var value = row["Series Code"]
 
            var editValue = value.replace(" ", "")

            if (!(isInArray(editValue, codes))){
                codes.push(editValue)

            }
        })
        console.log(codes)

        var newData = [];

        // create the years domain and initialize
        var years = [];
        for (var i = 1971; i < 2008; ++i) 
        {
            // convert to string to allow for string-key mapping
            years.push(i.toString());
        }

        // use all existing codes
        codes.forEach(function(code){
            // basic format of our object
            var newObject = {code: "", name: "", countries: {}}

            data.forEach(function(row){
                if (row["Series Code"] == code){
                    newObject.code = code
                    newObject.name= row["Series Name"]
                    
                    //var country = {};
                    newObject.countries[row["Country Name"]] = {};
                    years.forEach(function(year){
                        var value = row[year]
                        newObject.countries[row["Country Name"]][year] = value;
                    })
                    //newObject.countries.push(country)
                }
            })
            newData.push(newObject);
        })

        console.log(newData)
        console.log(newData[0].countries["United States"]["1985"])
        saveToFile(newData,"globalenergyuse-cleaned.json")
    });




