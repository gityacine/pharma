const express = require('express');
var sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let db = new sqlite3.Database('test/test.db', (err) => {
    if (err) {
        console.error(err);
    }
});

//"SELECT product_materials.productID, product.name AS productName, product_materials.materialID, material.name AS materialName, material.class, material.quantity, material.unit, product_materials.coeff, (1.0 * material.quantity / product_materials.coeff) AS maxLot FROM product_materials INNER JOIN product ON product_materials.productID = product.id INNER JOIN material ON product_materials.materialID = material.id ORDER BY product_materials.productID, maxLot"

app.get('/api/product-materials', (req, res) => {
    const sql = "SELECT productID, materialID, coeff FROM product_materials ORDER BY productID";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            if (rows.length > 0) {
                const result = [
                    {
                        id: rows[0].productID,
                        materials: [
                            {
                                id: rows[0].materialID,
                                coeff: rows[0].coeff,
                            }
                        ]
                    }
                ];
                for (let i = 1; i < rows.length; i++) {
                    if (rows[i].productID === result[result.length - 1].id) {
                        result[result.length - 1].materials.push({
                            id: rows[i].materialID,
                            coeff: rows[i].coeff,
                        });
                    } else {
                        result.push({
                            id: rows[i].productID,
                            materials: [
                                {
                                    id: rows[i].materialID,
                                    coeff: rows[i].coeff,
                                }
                            ],
                        });
                    }
                }
                res.json(result);
            } else {
                res.json(rows);
            }
        }
    });
});

app.get('/api/materials', (req, res) => {
    const sql = "SELECT * FROM material";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/materials', (req, res) => {
    const { id, name, cls } = req.body;
    const sql = "INSERT INTO material (id, name, class) VALUES (?, ?, ?)";
    const params = [id, name, cls];
    db.run(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.json({
                data: {
                    id: id, name: name, class: cls
                }
            });
        }
    });
});

app.get('/api/materials/:id', (req, res) => {
    const sql = "SELECT * FROM material WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.json({ data: row });
        }
    });
});

app.patch('/api/materials/:id', (req, res) => {
    const { id } = req.params;
    const { name, cls } = req.body;
    const sql = "UPDATE material SET name = COALESCE(?, name), class = COALESCE(?, class)  WHERE id = ?";
    const params = [name, cls, id];
    db.run(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: res.message });
        } else {
            res.json({
                data: {
                    id: id, name: name, class: cls
                }
            });
        }
    });
});


app.delete('/api/materials/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM material WHERE id = ?";
    const params = [id];
    db.run(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: res.message });
        } else {
            res.json({ id: id });
        }
    });
});

app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM product";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/products', (req, res) => {
    const { id, name, cls, materials } = req.body;
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        db.run("INSERT INTO product (id, name, class) VALUES (?, ?, ?)", [id, name, cls], (err, result) => {
            if (err) {
                res.status(400).json({ error: res.message });
            } else {
                for (const material of materials) {
                    db.run("INSERT INTO product_materials (productID, materialID, coeff) VALUES (?, ?, ?)", [id, material.id, material.coeff], (err, result) => {
                        if (err) {
                            db.run("ROLLBACK");
                            res.status(400).json({ error: res.message });
                        }
                    });
                }
            }
        });
        db.run("COMMIT TRANSACTION");
        res.json({ id: id });
    });
});

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});