import express from "express";
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';


const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "login"
});


app.post('/ingreso', (req, res) => {
    const sql = "SELECT * FROM registro WHERE `Usuario` = ? AND `Contrasena` = ?";
    const values = [
        req.body.Usuario,
        req.body.Contrasena
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.json({ Message: "Error al entrar al servidor" });
        }
        if (result.length > 0) {
            const user = result[0];
            const token = jwt.sign({ Usuario: user.Usuario }, 'tu_clave_secreta', { expiresIn: '1h' });
            // Los datos ingresados son válidos, el usuario puede iniciar sesión
            return res.json({ Message: "Inicio de sesión exitoso", token: token });
        } else {
            // Los datos ingresados no coinciden con ningún registro en la base de datos
            return res.json({ Message: "Credenciales inválidas" });
        }
    });
});


app.post('/registro', (req, res) => {
    const sql = "INSERT INTO registro (`Nombre`, `Apellido`, `Usuario`, `Contrasena`) VALUES (?, ?, ?, ?)";
    console.log(req.body);
    console.log(req);
    const values = [
        req.body.Nombre,
        req.body.Apellido,
        req.body.Usuario,
        req.body.Contrasena
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error al guardar los datos en la base de datos" });
        }
        return res.status(200).json({ message: "Datos guardados correctamente" });
        return res.json(result);
    });
});


app.post('/guardar', verificarToken, (req, res) => {
    const sql = "INSERT INTO psicologico (`Usuario`, `resultado`) VALUES (?, ?)";
    const values = [
        req.body.Usuario,
        req.body.resultado
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error al guardar el resultado del test" });
        } if (result.length > 0) {
            const user = result[0];
            const token = jwt.sign({ Usuario: user.Usuario }, 'tu_clave_secreta', { expiresIn: '1h' });
            // Los datos ingresados son válidos, el usuario puede iniciar sesión
            return res.json({ Message: "Inicio de sesión exitoso", token: token });
        } else {
            return res.status(200).json({ message: "Resultado del test guardado correctamente" });
        }
    });
});


app.listen(8081, () => {
    console.log("Servidor iniciado en el puerto 8081");
});
