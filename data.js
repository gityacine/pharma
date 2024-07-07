const fs = require('fs');
const csv = require('csv-parser');
var sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('app.db', (err) => {
    if (err) {
        console.error(err);
    }
});



fs.createReadStream('./data.csv')
    .pipe(csv())
    .on('data', (row) => {
        // here we save record to database
        const { id, a, b, c, d, e } = row;
        const sql = "INSERT INTO product_materials (productID, materialID, coeff) VALUES (?, ?, ?)";

        if (a !== "") {
            const params = ["TB144P01", id, a];
            count++;
        }
        if (b !== "") {
            const params = ["LQ027P01", id, b];
            count++;
        }
        if (c !== "") {
            const params = ["TB007P01", id, c];
            count++;
        }
        if (d !== "") {
            const params = ["TB006P01", id, d];
            count++;
        }
        if (e !== "") {
            const params = ["TB005P01", id, e];
            count++;
        }

        /*
        const sql = "INSERT INTO material (id, name, class, unit, quantity) VALUES (?, ?, ?, ?, ?)";
        const params = [id, name, cls, unt, quantity];
        db.run(sql, params, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                console.log(row);
            }
        });
        console.log('created');
        */
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });
