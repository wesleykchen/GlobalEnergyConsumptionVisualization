    var saveToFile = function(object, filename){
        var blob, blobText;
        blobText = [JSON.stringify(object)];
        blob = new Blob(blobText, {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, filename);
    }
    

    d3.csv("globalenergyuse-production.csv", function(data) {
        var codes = []
        function isInArray(value, array) {
            return array.indexOf(value) > -1;
        }
        //var values = ["EGEGYPRODKTOE", "EGELCCOALKH", "EGELCCOALZS", "EGELCHYROKH", "EGELCHYROZS", "EGELCLOSSKH", "EGELCLOSSZS", "EGELCNGASKH", "EGELCNGASZS", "EGELCNUCLKH", "EGELCNUCLZS", "EGELCPETRKH", "EGELCPETRZS", "EGELCPRODKH", "EGGDPPUSEKOPP", "EGGDPPUSEKOPPKD", "EGIMPCONSZS", "EGUSECOMMCLZS", "EGUSECOMMFOZS", "EGUSECOMMGDPPKD", "EGUSECOMMKTOE", "EGUSECRNWKTOE",  "EGUSECRNWZS", "EGUSEELECKH", "EGUSEELECKHPC", "EGUSEPCAPKGOE"];
        //values.forEach(function(value){
            data.forEach(function(row){
                var value = row["Series Code"]
                //console.log(value, "value")
                var editValue = value.replace(" ", "")
                //console.log(editValue, "editValue")
                if (!(isInArray(editValue, codes))){
                    codes.push(editValue)
                    //console.log(codes)
                }
            })
            console.log(codes)
        //}
        var newData = []
        codes.forEach(function(code){
            var newObject = {code: "", name:"", countries: []}
            data.forEach(function(row){
                if (row["Series Code"] == code){
                    newObject.code = code
                    newObject.name= row["Series Name"]
                    var years = [1971, 1972, 1973, 1974, 1975, 1976 ,1977 ,   1978   , 1979,    1980 ,   1981   , 1982   , 1983  ,  1984   , 1985 ,   1986,    1987,    1988  ,  1989   , 1990  ,  1991  ,  1992 ,   1993 ,   1994 ,   1995  ,  1996  ,  1997   , 1998 ,   1999,    2000,   2001  ,  2002 ,   2003   , 2004  ,  2005  , 2006   , 2007   , 2008 ,   2009];
                    var country = {ccode: row["Country Code"], cname: row["Country Name"], yearly: []}
                    years.forEach(function(year){
                        var value = row[year]
                        country.yearly.push({year: year, value: value})
                    })
                    newObject.countries.push(country)
                }else{
                    //console.log("Break")
                }
            })
            //console.log(newObject)
            newData.push(newObject)
        })
        //console.log(newData)
        saveToFile(newData,"newData.json")
    });

    d3.json("newData.json", function(data) {
        console.log(data)
    })





