import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { writeFile, readFile } from "node:fs/promises";

const app = express();
const PORT = 3000;

// Configuración para obtener la ruta actual del script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para parsear JSON
app.use(express.json());

// Ruta para servir el archivo HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Ruta GET: Devuelve todas las canciones
app.get("/canciones", async (req, res) => {
    try {
        const data = await readFile("repertorio.json", "utf-8");
        const canciones = JSON.parse(data);
        res.json(canciones);
    } catch (error) {
        res.status(500).json({ error: "Error al leer el archivo" });
    }
});

// Ruta POST: Agregar una nueva canción
app.post("/canciones", async (req, res) => {
    try {
        const nuevaCancion = req.body;
        const data = await readFile("repertorio.json", "utf-8");
        const canciones = JSON.parse(data);
        canciones.push(nuevaCancion); // Agrega la nueva canción
        await writeFile("repertorio.json", JSON.stringify(canciones, null, 2));
        res.status(201).json(nuevaCancion);
    } catch (error) {
        res.status(500).json({ error: "Error al guardar la canción" });
    }
});

// Ruta PUT: Modificar una canción existente
app.put("/canciones/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const actualizacion = req.body;
        const data = await readFile("repertorio.json", "utf-8");
        let canciones = JSON.parse(data);

        const index = canciones.findIndex((c) => c.id === id);
        if (index === -1) return res.status(404).json({ error: "Canción no encontrada" });

        canciones[index] = { ...canciones[index], ...actualizacion };
        await writeFile("repertorio.json", JSON.stringify(canciones, null, 2));
        res.json(canciones[index]);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la canción" });
    }
});

app.delete("/canciones/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = await readFile("repertorio.json", "utf-8");
        let canciones = JSON.parse(data);

        const index = canciones.findIndex((c) => c.id === id); // Comparar como strings
        if (index === -1) {
            console.log("Canción no encontrada");
            return res.status(404).json({ error: "Canción no encontrada" });
        }

        canciones.splice(index, 1);
        await writeFile("repertorio.json", JSON.stringify(canciones, null, 2));
        res.json({ message: "Canción eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar la canción:", error);
        res.status(500).json({ error: "Error al eliminar la canción" });
    }
});



app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});