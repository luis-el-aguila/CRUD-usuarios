//punto de entrada de la app

// importo las librerias que usare
const express = require("express");
const admin = require("firebase-admin");
require("dotenv").config(); // para las variables de entorno

// inicializar firebase admin con el archivo de credenciales
const serviceAccount = require("./firebase-credentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// obtener instancia de firestore
const db = admin.firestore();

// inicializa express
const app = express();
app.use(express.json());

//puerto de la app

const PORT = process.env.PORT || 3000;

// ruta de prueba para ver si todo funciona
app.get("/", (req, res) => {
  res.send("API de usuarios con firebase esta funcionando");
});

// endpoint para crear usuario
app.post("/users", async (req, res) => {
  try {
    const { nombre, email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "El email es obligatorio" });
    }
    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    //creo el usuario
    const nuevoUsuario = { nombre, email };
    // guardo el usuario en firestore
    const docRef = await db.collection("users").add(nuevoUsuario);

    // devuelvo confirmacion de creacion
    res.status(201).json({ id: docRef.id, ...nuevoUsuario });
  } catch (error) {
    console.error("error al crear usuario:", error);
    res.status(500).json({ error: "error interno del servidor" });
  }
});

//endpoint para optener al usuario por ID
app.get("/users/:id", async (req, res) => {
  try {
    //obengo id de los paremetros de la url
    const userId = req.params.id;

    //busco el documento en firestore
    const doc = await db.collection("users").doc(userId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "usuario no encontrado" });
    }
    //devolver al usuario
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    //manejamos errores de coneccion u otros
    console.error("error al obtener usuario:", error);
    res.status(500).json({ error: "error interno del servidor" });
  }
});

//endpoint para actualizar usuario
app.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { nombre, email } = req.body;

    //validar que el usuario existe
    if (!nombre && !email) {
      return res.status(400).json({
        error:
          "debes enviar al menos un campo para actualizar (nombre o email)",
      });
    }

    //buscar el usuario en firebase
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "usuario no encontrado" });
    }

    // crear el objeto del usuario actualizado
    const datosActualizados = {};
    if (nombre) datosActualizados.nombre = nombre;
    if (email) datosActualizados.email = email;

    //actualizar en firebase
    await userRef.update(datosActualizados);

    //devolver el usuario actualizado
    res.status(200).json({ id: doc.id, ...doc.data(), ...datosActualizados });
  } catch (error) {
    console.error("error al actualizar usuario:", error);
    res.status(500).json({ error: "error interno del servidor" });
  }
});

// endpoint para eliminar usuario
app.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // buscar el usuario en firestore
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "usuario no encontrado" });
    }

    //eliminar al usuario
    await userRef.delete();

    //confirma la eliminacion
    res.status(200).json({ message: "usuario eliminado correctamente" });
  } catch (error) {
    console.error("error al eliminar usuario:", error);
    res.status(500).json({ error: "error interno del servidor" });
  }
});

// levantar el servidor
app.listen(PORT, () => {
  console.log(`servidor escuchando en el puerto ${PORT}`);
});
