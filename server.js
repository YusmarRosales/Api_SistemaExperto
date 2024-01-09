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
    const values = [req.body.Usuario, req.body.Contrasena];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error al consultar la base de datos:", err);
            return res.json({ Message: "Error al entrar al servidor" });
        }

        if (result.length > 0) {
            const user = result[0];

            // Agregar un registro de consola para ver el contenido de 'user'
            console.log("Usuario encontrado:", user);

            // Comprobar si 'user' contiene el campo 'Usuario'
            if (user.Usuario) {
                const token = jwt.sign({ Usuario: user.Usuario, rol: user.rol }, 'tu_clave_secreta', { expiresIn: '1h' });
                return res.json({ 
                    Message: "Inicio de sesión exitoso",
                    token: token 
                    });
            } else {
                console.error("El campo 'Usuario' no se encuentra en el objeto 'user'");
                return res.status(500).json({ Message: "Error interno del servidor" });
            }
        } else {
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

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log("token", token);
    if (!token) {
        return res.status(403).send("Se requiere un token para autenticación");
    }

    try {
        const decoded = jwt.verify(token.split("Bearer ")[1], 'tu_clave_secreta');
        req.Usuario = decoded.Usuario;
        next();
    } catch (error) {
        return res.status(401).send("Token inválido");
    }
};

app.post('/guardar', verificarToken, (req, res) => {
    const Usuario = req.Usuario;
    const resultado = req.body.resultado;

    console.log("Usuario:", Usuario);
    console.log("Resultado:", resultado);

    if (!Usuario || !resultado) {
        return res.status(400).json({ error: "Usuario o resultado no proporcionados" });
    }

    const sql = "INSERT INTO psicologico (`Usuario`, `resultado`) VALUES (?, ?)";
    db.query(sql, [Usuario, resultado], (err, result) => {
        if (err) {
            console.error("Error al guardar en psicologico:", err);
            return res.status(500).json({ error: "Error al guardar el resultado del test" });
        }
        return res.status(200).json({ message: "Resultado del test guardado correctamente" });
    });
});

app.get('/verificarTest', verificarToken, (req, res) => {
    const Usuario = req.Usuario;

    if (!Usuario) {
        return res.status(400).json({ error: "Usuario no proporcionado" });
    }

    const sql = "SELECT * FROM psicologico WHERE Usuario = ?";
    db.query(sql, [Usuario], (err, result) => {
        if (err) {
            console.error("Error al consultar en psicologico:", err);
            return res.status(500).json({ error: "Error al verificar el test" });
        }

        if (result.length > 0) {
            // El usuario ya completó el test
            return res.json({ testCompletado: true });
        } else {
            // El usuario no ha completado el test
            return res.json({ testCompletado: false });
        }
    });
});

//enpoind para ver los resultados
app.get('/resultadosPsicolo', (req, res) => {
    const sql = "SELECT * FROM psicologico";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener los resultados:", err);
            return res.status(500).json({ error: "Error al obtener los resultados" });
        }
        res.json(results);
    });
});

app.post('/guardarJ', verificarToken, (req, res) => {
    const Usuario = req.Usuario;
    const resultado = req.body.resultado;

    console.log("Usuario:", Usuario);
    console.log("Resultado:", resultado);

    if (!Usuario || !resultado) {
        return res.status(400).json({ error: "Usuario o resultado no proporcionados" });
    }

    const sql = "INSERT INTO juridico (`Usuario`, `resultado`) VALUES (?, ?)";
    db.query(sql, [Usuario, resultado], (err, result) => {
        if (err) {
            console.error("Error al guardar en psicologico:", err);
            return res.status(500).json({ error: "Error al guardar el resultado del test" });
        }
        return res.status(200).json({ message: "Resultado del test guardado correctamente" });
    });
});

app.get('/verificarTestJuri', verificarToken, (req, res) => {
    const Usuario = req.Usuario;

    if (!Usuario) {
        return res.status(400).json({ error: "Usuario no proporcionado" });
    }

    const sql = "SELECT * FROM juridico WHERE Usuario = ?";
    db.query(sql, [Usuario], (err, result) => {
        if (err) {
            console.error("Error al consultar en psicologico:", err);
            return res.status(500).json({ error: "Error al verificar el test" });
        }

        if (result.length > 0) {
            // El usuario ya completó el test
            return res.json({ testCompletado: true });
        } else {
            // El usuario no ha completado el test
            return res.json({ testCompletado: false });
        }
    });
});

//enpoind para ver los resultados
app.get('/resultadosJuridic', (req, res) => {
    const sql = "SELECT * FROM juridico";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener los resultados:", err);
            return res.status(500).json({ error: "Error al obtener los resultados" });
        }
        res.json(results);
    });
});

app.listen(8081, () => {
    console.log("Servidor iniciado en el puerto 8081");
});
